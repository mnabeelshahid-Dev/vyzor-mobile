import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import Signature from "react-native-signature-canvas";
import RefreshSignatureIcon from '../../assets/svgs/RefreshSignature.svg';

const { width } = Dimensions.get('window');
const CARD_RADIUS = 16;

// Responsive scaling helper (based on iPhone 14 Pro width, 390)
const getResponsive = (val: number) => Math.round(val * (width / 390));

interface SignatureFieldProps {
    rowId: string;
    value?: string;
    onSignature?: (rowId: string, encoded: string) => void;
    onClear?: (rowId: string) => void;
    setRef?: (rowId: string, ref: any) => void;
    style?: any;
    readonly?: boolean;
    required?: boolean;
    onValidationChange?: (rowId: string, hasSignature: boolean) => void;
}

const SignatureField: React.FC<SignatureFieldProps> = ({
    rowId,
    value,
    onSignature,
    onClear,
    setRef,
    style,
    readonly = false,
    required = false,
}) => {
    const signatureRef = useRef<any>(null);
    const mountedRef = useRef(true);

    const [hasSignature, setHasSignature] = useState(!!value);

    /* -----------------------------
       Sync external value
    ----------------------------- */
    useEffect(() => {
        setHasSignature(!!value);
    }, [value]);

    /* -----------------------------
       Helpers
    ----------------------------- */
    const getDataUrl = (base64?: string) => {
        if (!base64) return undefined;
        return base64.startsWith("data:")
            ? base64
            : `data:image/png;base64,${base64}`;
    };

    /* -----------------------------
       Clear signature
    ----------------------------- */
    const handleClear = useCallback(() => {
        if (readonly) return;

        signatureRef.current?.clearSignature();
        setHasSignature(false);
        onClear?.(rowId);
    }, [readonly, rowId, onClear]);
    /* -----------------------------
       Save signature
    ----------------------------- */
    const handleSignatureSave = useCallback(
        (base64: string) => {
            if (!mountedRef.current || readonly) return;

            const encoded = base64.replace(/^data:image\/\w+;base64,/, "");
            if (encoded.length < 100) return;

            setHasSignature(true);
            onSignature?.(rowId, encoded);
        },
        [rowId, readonly, onSignature]
    );

    /* -----------------------------
       Auto-save on draw end
    ----------------------------- */
    const handleDrawEnd = useCallback(() => {
        setTimeout(() => {
            if (mountedRef.current) {
                signatureRef.current?.readSignature();
            }
        }, 200);
    }, []);

    /* -----------------------------
       Edit signature
    ----------------------------- */
    const handleEdit = () => {
        if (readonly) return;
        setHasSignature(false);
    };

    /* -----------------------------
       Expose methods to parent
    ----------------------------- */
    useEffect(() => {
        if (setRef) {
            setRef(rowId, {
                clearSignature: handleClear,
                saveSignature: () => signatureRef.current?.readSignature(),
            });
        }
    }, [rowId, setRef, handleClear]);

    /* -----------------------------
       Cleanup
    ----------------------------- */
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    /* -----------------------------
       Render
    ----------------------------- */
    return (
        <View style={[{ width: "100%", height: 200 }, style]}>
            {hasSignature && value ? (
                <View style={{ flex: 1, position: "relative" }}>
                    <Image
                        source={{ uri: getDataUrl(value) }}
                        style={{
                            flex: 1,
                            backgroundColor: "#D9ECFF",
                            borderRadius: 10
                        }}
                        resizeMode="contain"
                    />

                    {!readonly && (
                        <TouchableOpacity
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                            onPress={handleEdit}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 12,
                                backgroundColor: '#0088E7',
                                padding: getResponsive(4),
                                borderRadius: getResponsive(12),
                            }}
                        >
                            <RefreshSignatureIcon width={getResponsive(16)} height={getResponsive(16)} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: readonly ? "#f5f5f5" : "#D9ECFF",
                        borderRadius: 10
                        // borderWidth: 1,
                        // borderColor: "#8CC7FF",
                    }}
                >
                    {!readonly ? (
                        <Signature
                            ref={signatureRef}
                            onOK={handleSignatureSave}
                            onEnd={handleDrawEnd}
                            autoClear={false}
                            trimWhitespace={false}
                            backgroundColor="#D9ECFF"
                            penColor="#000"
                            descriptionText=""
                            clearText=""
                            confirmText=""
                            webStyle={`
                body {
                  margin: 0;
                  padding: 0;
                  background: #D9ECFF;
                }
                .m-signature-pad {
                  border-radius: 10px;
                  box-shadow: none;
                }
                .m-signature-pad--footer {
                  display: none;
                }
                canvas {
                  background: #D9ECFF;
                }
              `}
                        />
                    ) : (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#999" }}>No signature available</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default SignatureField;
