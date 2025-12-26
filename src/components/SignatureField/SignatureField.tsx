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
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedDataRef = useRef<string | null>(null);
    
    // MINIMAL state - only what's absolutely necessary
    const [showImageMode, setShowImageMode] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [componentKey] = useState(`sig-${rowId}`); // Stable key without timestamp
    
    const { getSignature, setSignature, clearSignature } = useSignatureStore();

    // Clear signature - simple and direct
    const handleClear = useCallback(() => {
        console.log(`🗑️ Clearing signature for ${rowId}`);
        
        // Clear any pending auto-save
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }
        
        clearSignature(String(rowId));
        setShowImageMode(false);
        setSignatureDataUrl(null);
        lastSavedDataRef.current = null;
        onClear?.(rowId);
    }, [rowId, clearSignature, onClear]);

    // Save signature - simple and direct
    const handleSave = useCallback(() => {
        if (internalRef.current?.readSignature) {
            console.log(`💾 Saving signature for ${rowId}`);
            internalRef.current.readSignature();
        }
    }, [rowId]);

    // Set ref for parent
    useEffect(() => {
        if (setRef) {
            setRef(rowId, {
                clearSignature: handleClear,
                saveSignature: handleSave
            });
        }
    }, [setRef, rowId, handleClear, handleSave]);

    // Load existing signature whenever component mounts or rowId changes
    useEffect(() => {
        try {
            setIsLoading(true);
            const savedSignature = getSignature(String(rowId));
            
            if (savedSignature?.encoded && mountedRef.current) {
                const dataUrl = `data:image/png;base64,${savedSignature.encoded}`;
                setSignatureDataUrl(dataUrl);
                setShowImageMode(true);
                lastSavedDataRef.current = savedSignature.encoded;
                
                // Only call onSignature if this is a new signature we haven't reported yet
                if (onSignature && savedSignature.encoded !== lastSavedDataRef.current) {
                    onSignature(rowId, savedSignature.encoded);
                }
                
                console.log(`✅ Loaded existing signature for ${rowId}, length: ${savedSignature.encoded.length}`);
            } else {
                // Reset to drawing mode if no signature exists
                setShowImageMode(false);
                setSignatureDataUrl(null);
                lastSavedDataRef.current = null;
                console.log(`ℹ️ No existing signature for ${rowId}`);
            }
        } catch (error) {
            console.error(`❌ Error loading signature for ${rowId}:`, error);
            setShowImageMode(false);
            setSignatureDataUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [rowId]); // Only depend on rowId, not sectionId to avoid unnecessary reloads

    // Handle signature save from WebView
    const handleSignatureSave = useCallback((base64: string) => {
        if (!mountedRef.current) return;
        
        try {
            const encoded = base64.replace(/^data:image\/\w+;base64,/, "");
            
            // Don't save if it's the same as the last saved data
            if (encoded === lastSavedDataRef.current) {
                console.log(`⏭️ Skipping duplicate save for ${rowId}`);
                return;
            }
            
            console.log(`📝 Signature saved for ${rowId}, length: ${encoded.length}`);
            
            // Save to store first
            setSignature(String(rowId), encoded, sectionId, documentId);
            
            // Update UI
            setSignatureDataUrl(base64);
            setShowImageMode(true);
            lastSavedDataRef.current = encoded;
            
            // Immediately notify parent to clear validation - use setTimeout to ensure store update completes
            setTimeout(() => {
                if (mountedRef.current && onSignature) {
                    console.log(`✅ Notifying parent of signature save for ${rowId}`);
                    onSignature(rowId, encoded);
                }
            }, 100);
            
        } catch (error) {
            console.error(`❌ Error saving signature for ${rowId}:`, error);
        }
    }, [rowId, sectionId, documentId, setSignature, onSignature]);

    // Edit signature
    const handleEdit = useCallback(() => {
        console.log(`✏️ Editing signature for ${rowId}`);
        setShowImageMode(false);
    }, [rowId]);

    // ULTRA MINIMAL WebView callbacks - auto-save on draw end
    const handleWebViewReady = useCallback(() => {
        console.log(`✅ WebView ready for ${rowId}`);
    }, [rowId]);

    const handleDrawStart = useCallback(() => {
        console.log(`🖊️ Drawing started on ${rowId}`);
    }, [rowId]);

    const handleDrawEnd = useCallback(() => {
        if (!mountedRef.current) return;
        
        console.log(`⏸️ Drawing ended on ${rowId} - scheduling auto-save...`);
        
        // Clear any existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }
        
        // Auto-save after a delay to ensure drawing is complete
        autoSaveTimerRef.current = setTimeout(() => {
            if (mountedRef.current && internalRef.current?.readSignature) {
                try {
                    console.log(`💾 Auto-saving signature for ${rowId}`);
                    internalRef.current.readSignature();
                } catch (error) {
                    console.error(`❌ Error auto-saving signature for ${rowId}:`, error);
                }
            }
            autoSaveTimerRef.current = null;
        }, 500); // Increased delay to 500ms for better reliability
    }, [rowId]);

    const handleEmpty = useCallback(() => false, []);

    // Cleanup
    useEffect(() => {
        mountedRef.current = true;
        
        return () => {
            mountedRef.current = false;
            
            // Clear any pending auto-save timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
                autoSaveTimerRef.current = null;
            }
        };
    }, []);

    // Don't render anything while loading
    if (isLoading) {
        return (
            <View style={[{ width: "100%", height: 200, minHeight: 200, justifyContent: 'center', alignItems: 'center' }, style]}>
                <Text style={{ color: '#666' }}>Loading signature...</Text>
            </View>
        );
    }

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
                </View>
            )}
        </View>
    );
};

export default SignatureField;