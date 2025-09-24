import React, { useState, useRef } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TextInputProps,
    Text,
} from "react-native";

interface FloatingInputProps extends TextInputProps {
    label: string;
    LeftIcon?: React.FC<any>;
    RightIcon?: React.FC<{ width?: number; height?: number }>;
    RightIconAlt?: React.FC<{ width?: number; height?: number }>;
    secureTextEntry?: boolean;
    onRightIconPress?: () => void;
    errorMessage?: string;
    isStaric?: boolean;
    leftIconProps?: { color?: string };
}

const FloatingInput: React.FC<FloatingInputProps> = (props) => {
    const {
        label,
        LeftIcon,
        RightIcon,
        RightIconAlt,
        secureTextEntry = false,
        errorMessage,
        value,
        onChangeText,
        isStaric,
        ...rest
    } = props;

    const inputRef = useRef<InstanceType<typeof TextInput>>(null);
    const [secure, setSecure] = useState(secureTextEntry);

    // Determine border color
    let borderColor = "#475467";
    if (errorMessage) borderColor = "#FF6B6B";
    else if (value && !errorMessage) borderColor = "#0088E7";

    // Right icon logic
    let showCheckIcon = value && !errorMessage && RightIcon;
    let showPasswordToggle =
        RightIconAlt && typeof secureTextEntry !== "undefined";

    return (
        <View style={[styles.container]}>
            <View style={styles.row}>
                <View style={{ flex: 1, position: "relative" }}>
                    {/* Fixed Label */}

                    <View style={styles.labelWrapper}>
                        {LeftIcon && <LeftIcon width={20} height={20} {...props.leftIconProps} />}
                        <Text
                            style={[
                                styles.label, { bottom: 1 }
                            ]}
                        >
                            {label}
                        </Text>
                        {isStaric ? <Text style={{ color: '#FF6B6B', fontSize: 14, fontWeight: 'bold', marginLeft: 3, top: -2 }}>*</Text> : null}
                    </View>

                    {/* Input */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                            borderBottomColor: borderColor,
                            borderBottomWidth: 1,
                        }}
                    >
                        <TextInput
                            ref={inputRef}
                            {...rest}
                            style={styles.input}
                            secureTextEntry={secure}
                            value={value}
                            onChangeText={onChangeText}
                        />
                        {/* Show check icon if valid and no error */}
                        {showCheckIcon && RightIcon && (
                            <View style={styles.rightIconWrapper}>
                                <RightIcon width={22} height={22} />
                            </View>
                        )}
                        {/* Show alt icon for password toggle */}
                        {showPasswordToggle && (
                            <TouchableOpacity
                                onPress={() => setSecure(!secure)}
                                style={styles.rightIconWrapper}
                                disabled={props.editable === false}
                            >
                                {secure ? (
                                    <RightIconAlt width={22} height={22} />
                                ) : (
                                    <Text style={{ fontSize: 18, color: "#9CA3AF" }}>
                                        👁️‍🗨️
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
        </View>
    );
};

export default FloatingInput;

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        width: "100%",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    input: {
        paddingHorizontal: 0,
        paddingVertical: 8,
        fontSize: 16,
        color: "#021639",
        backgroundColor: "transparent",
        flex: 1,
    },
    labelWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        marginLeft: 4,
        fontSize: 14,
        color: "#475467",
    },
    rightIconWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: {
        color: "#FF6B6B",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 2,
    },
});
