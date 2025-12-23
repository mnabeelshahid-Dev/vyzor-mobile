import React, { useEffect, useRef, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Signature from "react-native-signature-canvas";
import { useSignatureStore } from "../../store/signatureStore";

interface SignatureFieldProps {
    rowId: string;
    sectionId: number;
    documentId: string;
    onSignature?: (rowId: string, encoded: string) => void;
    onClear?: (rowId: string) => void;
    setRef?: (rowId: string, ref: any) => void;
    style?: any;
}

const SignatureField: React.FC<SignatureFieldProps> = ({
    rowId,
    sectionId,
    documentId,
    onSignature,
    onClear,
    setRef,
    style
}) => {
    const internalRef = useRef(null);
    const mountedRef = useRef(true);
    const initializationRef = useRef(false);
    
    // MINIMAL state - only what's absolutely necessary
    const [showImageMode, setShowImageMode] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState(null);
    const [componentKey] = useState(`sig-${rowId}-${Date.now()}`);
    
    const { getSignature, setSignature, clearSignature } = useSignatureStore();

    // Clear signature - simple and direct
    const handleClear = useCallback(() => {
        console.log(`🗑️ Clearing signature for ${rowId}`);
        clearSignature(String(rowId));
        setShowImageMode(false);
        setSignatureDataUrl(null);
        onClear?.(rowId);
    }, [rowId, clearSignature, onClear]);

    // Save signature - simple and direct
    const handleSave = useCallback(() => {
        if (internalRef.current?.readSignature) {
            console.log(`💾 Saving signature for ${rowId}`);
            internalRef.current.readSignature();
        }
    }, [rowId]);

    // Set ref for parent - ONCE ONLY
    useEffect(() => {
        if (setRef && !initializationRef.current) {
            setRef(rowId, {
                clearSignature: handleClear,
                saveSignature: handleSave
            });
            initializationRef.current = true;
        }
    }, [setRef, rowId, handleClear, handleSave]);

    // Initialize with existing signature - ONCE ONLY
    useEffect(() => {
        if (!initializationRef.current) {
            const savedSignature = getSignature(String(rowId));
            if (savedSignature?.encoded) {
                const dataUrl = `data:image/png;base64,${savedSignature.encoded}`;
                setSignatureDataUrl(dataUrl);
                setShowImageMode(true);
                onSignature?.(rowId, savedSignature.encoded);
            }
            initializationRef.current = true;
        }
    }, []); // Empty dependency array - run once only

    // Handle signature save from WebView
    const handleSignatureSave = useCallback((base64) => {
        try {
            const encoded = base64.replace(/^data:image\/\w+;base64,/, "");
            console.log(`📝 Signature saved for ${rowId}`);
            
            setSignature(String(rowId), encoded, sectionId, documentId);
            setSignatureDataUrl(base64);
            setShowImageMode(true);
            
            onSignature?.(rowId, encoded);
        } catch (error) {
            console.error(`Error saving signature:`, error);
        }
    }, [rowId, sectionId, documentId, setSignature, onSignature]);

    // Edit signature
    const handleEdit = useCallback(() => {
        setShowImageMode(false);
    }, []);

    // ULTRA MINIMAL WebView callbacks - no state changes
    const handleWebViewReady = useCallback(() => {
        console.log(`WebView ready for ${rowId}`);
    }, [rowId]);

    const handleDrawStart = useCallback(() => {
        console.log(`Drawing started on ${rowId}`);
    }, [rowId]);

    const handleDrawEnd = useCallback(() => {
        console.log(`Drawing ended on ${rowId}`);
    }, [rowId]);

    const handleEmpty = useCallback(() => false, []);

    // Cleanup
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return (
        <View style={[{ width: "100%", height: 200, minHeight: 200 }, style]}>
            {showImageMode && signatureDataUrl ? (
                <View style={{ flex: 1, position: 'relative' }}>
                    <Image 
                        source={{ uri: signatureDataUrl }} 
                        style={{ 
                            flex: 1, 
                            backgroundColor: 'rgba(49,170,255,0.2)',
                            borderRadius: 8 
                        }}
                        resizeMode="contain"
                    />
                    
                    <TouchableOpacity
                        onPress={handleEdit}
                        style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            backgroundColor: '#0088E7',
                            paddingHorizontal: 6,
                            paddingVertical: 3,
                            borderRadius: 3,
                            zIndex: 10
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '500' }}>
                            Edit
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(49,170,255,0.2)', 
                    borderRadius: 8 
                }}>
                    <Signature
                        key={componentKey}
                        ref={internalRef}
                        onOK={handleSignatureSave}
                        onEmpty={handleEmpty}
                        onLoadEnd={handleWebViewReady}
                        onBegin={handleDrawStart}
                        onEnd={handleDrawEnd}
                        autoClear={false}
                        trimWhitespace={false}
                        backgroundColor="rgba(49,170,255,0.2)"
                        penColor="#000"
                        descriptionText=""
                        clearText=""
                        confirmText=""
                        webStyle={`
                            body { 
                                margin: 0; 
                                padding: 0; 
                                background: rgba(49,170,255,0.2);
                            }
                            .m-signature-pad { 
                                border: none; 
                                box-shadow: none; 
                                background: rgba(49,170,255,0.2);
                            }
                            .m-signature-pad--footer { 
                                display: none; 
                            }
                            canvas { 
                                background: rgba(49,170,255,0.2);
                            }
                        `}
                    />

                    <TouchableOpacity
                        onPress={handleSave}
                        style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: '#4CAF50',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                            zIndex: 10
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default SignatureField;