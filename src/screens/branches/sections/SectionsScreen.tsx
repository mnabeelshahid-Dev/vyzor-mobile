import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
// Import Image Picker (install: npm install react-native-image-picker)
import { launchImageLibrary } from 'react-native-image-picker';
import CamaraIcon from '../../../assets/svgs/camaraIcon.svg';

const Radio = ({ selected }: { selected: boolean }) => (
    <View
        style={[
            {
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selected ? '#1292E6' : '#222E44',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 4,
            },
        ]}
    >
        {selected ? (
            <View
                style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#1292E6',
                }}
            />
        ) : null}
    </View>
);

const CameraIcon = () => (
    <View
        style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#1292E6',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <CamaraIcon width={44} height={44} />
    </View>
);

const RefreshIcon = () => (
    <View
        style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#E6F1FB',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 2,
            right: 2,
        }}
    >
        <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: 18 }}>↻</Text>
    </View>
);

const { width } = Dimensions.get('window');
const CARD_RADIUS = 16;

export default function SectionsScreen() {
    // State for answers, notes, signature etc.
    const [answers, setAnswers] = useState({
        q1: true,
        q2: true,
        q3: true,
        notes1: 'Yes all things are working fine.',
        notes2: 'Yes all okey',
        signature: true,
    });
    // State for multiple images
    const [images, setImages] = useState([
        {
            uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
            id: '1',
        },
        {
            uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
            id: '2',
        },
        {
            uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
            id: '3',
        },
    ]);

    // Picker handler for multiple images
    const handleAddImages = async () => {
        launchImageLibrary(
            {
                selectionLimit: 5, // set the max number of images user can select
                mediaType: 'photo',
            },
            response => {
                if (response.assets && response.assets.length > 0) {
                    // filter unique images
                    const newImgs = response.assets
                        .filter(a => a.uri)
                        .map(a => ({ uri: a.uri as string, id: a.fileName || a.uri || Math.random().toString() }));
                    setImages(prev =>
                        [...prev, ...newImgs].slice(0, 5) // max 5 images
                    );
                }
            }
        );
    };

    const handleRemoveImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const checklist = [
        {
            type: 'radio',
            question: 'Is the store front, entrance, and lobby area clean and presentable?',
            key: 'q1',
        },
        {
            type: 'radio',
            question: 'Are all lights, air conditioning, and power systems functioning properly?',
            key: 'q2',
        },
        {
            type: 'radio',
            question: 'Is the staff present, in uniform, and ready for their assigned shifts?',
            key: 'q3',
        },
        {
            type: 'images',
            label: 'Take Pictures;',
            key: 'imgs',
        },
        {
            type: 'notes',
            question: 'Are the POS (Point of Sale) system and payment terminals working?',
            key: 'notes1',
        },
        {
            type: 'notes',
            question: 'Is the opening cash float counted and verified in all registers?',
            key: 'notes2',
        },
        {
            type: 'signature',
            label: 'Signature',
            key: 'signature',
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F9FC' }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 28 }}>{'←'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sections</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                    <Text style={{ color: '#fff', fontSize: 17, fontWeight: '500', marginRight: 4 }}>
                        Scanning
                    </Text>
                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 6,
                            backgroundColor: '#F44336',
                        }}
                    />
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 0 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Task Summary Card */}
                <View style={styles.topCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={styles.topCardTitle}>Daily Operations Checklist</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.topCardSub}>#41516184</Text>
                        <Text style={styles.dot}>|</Text>
                        <Text style={styles.topCardSub}>SCHEDULE</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.topCardDate}>08/12/2025 5:55pm</Text>
                    </View>
                </View>

                {/* Checklist Card */}
                <View style={styles.formCard}>
                    {/* Checklist Title Row */}
                    <View
                        style={{
                            borderTopLeftRadius: CARD_RADIUS,
                            borderTopRightRadius: CARD_RADIUS,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingTop: 16,
                            paddingBottom: 10,
                            borderBottomColor: '#ECECEC',
                            borderBottomWidth: 1,
                        }}
                    >
                        <Text style={styles.formCardTitle}>Opening Checks</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.formCardTitle}>
                            <Text style={{ color: '#1292E6' }}>2</Text> of 2
                        </Text>
                    </View>
                    {/* Checklist */}
                    <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                        {checklist.map((item, idx) => {
                            if (item.type === 'radio') {
                                return (
                                    <View key={item.key} style={styles.radioRow}>
                                        <Text style={styles.radioLabel}>{item.question}</Text>
                                        <View style={styles.radioChoiceRow}>
                                            <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
                                                <Radio selected={Boolean(answers[item.key as keyof typeof answers])} />
                                                <Text style={styles.radioOptionText}>YES</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
                                                <Radio selected={!answers[item.key as keyof typeof answers]} />
                                                <Text style={styles.radioOptionText}>NO</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }
                            if (item.type === 'images') {
                                return (
                                    <View key={item.key} style={styles.mediaRow}>
                                        <Text style={[styles.radioLabel, { textAlign: 'center', width: '100%' }]}>{item.label}</Text>
                                        <View style={styles.multiImgBox}>
                                            {images.map(img => (
                                                <View key={img.id} style={styles.multiImgThumbBox}>
                                                    <Image source={{ uri: img.uri }} style={styles.multiImgThumb} />
                                                    <TouchableOpacity
                                                        style={styles.multiImgRemove}
                                                        onPress={() => handleRemoveImage(img.id)}
                                                    >
                                                        <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: 17 }}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <TouchableOpacity
                                                style={styles.multiImgAddBtn}
                                                onPress={handleAddImages}
                                                activeOpacity={0.7}
                                            >
                                                <CameraIcon />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }
                            if (item.type === 'notes') {
                                return (
                                    <View key={item.key} style={styles.notesRow}>
                                        <Text style={styles.radioLabel}>{item.question}</Text>
                                        <View style={styles.notesBox}>
                                            <Text style={styles.notesText}>{answers[item.key as keyof typeof answers]}</Text>
                                        </View>
                                    </View>
                                );
                            }
                            if (item.type === 'signature') {
                                return (
                                    <View key={item.key} style={styles.signatureRow}>
                                        <Text style={styles.radioLabel}>{item.label}</Text>
                                        <View style={styles.signatureBox}>
                                            <Image
                                                source={{
                                                    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Signature_example.svg/320px-Signature_example.svg.png',
                                                }}
                                                style={styles.signatureImg}
                                                resizeMode="contain"
                                            />
                                            <TouchableOpacity style={styles.signatureOverlay} activeOpacity={0.7}>
                                                <RefreshIcon />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }
                            return null;
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.submitBar}>
                <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85}>
                    <Text style={styles.submitBtnText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1292E6',
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        minHeight: 70,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        marginLeft: 18,
        flex: 1,
        textAlign: 'center',
    },
    topCard: {
        marginTop: 12,
        marginHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        shadowColor: '#0002',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 8,
    },
    topCardTitle: {
        color: '#222E44',
        fontWeight: '700',
        fontSize: 19,
    },
    topCardSub: {
        color: '#7A8194',
        fontWeight: '500',
        fontSize: 14,
        marginRight: 8,
    },
    dot: {
        color: '#7A8194',
        fontSize: 18,
        marginHorizontal: 2,
        marginRight: 8,
    },
    topCardDate: {
        fontSize: 14,
        color: '#7A8194',
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: CARD_RADIUS,
        marginHorizontal: 12,
        shadowColor: '#0002',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 20,
    },
    formCardTitle: {
        color: '#19233C',
        fontWeight: 'bold',
        fontSize: 20,
    },
    radioRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        marginBottom: 14,
        padding: 12,
    },
    radioLabel: {
        color: '#19233C',
        fontSize: 17,
        fontWeight: '500',
        marginBottom: 10,
    },
    radioChoiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
    },
    radioOptionText: {
        color: '#19233C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mediaRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        marginBottom: 14,
        padding: 12,
    },
    // Multiple images section
    multiImgBox: {
        backgroundColor: '#E6F1FB',
        borderRadius: 12,
        marginTop: 10,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: 90,
    },
    multiImgThumbBox: {
        marginRight: 8,
        marginBottom: 4,
        position: 'relative',
    },
    multiImgThumb: {
        width: 74,
        height: 74,
        borderRadius: 8,
    },
    multiImgRemove: {
        position: 'absolute',
        top: -7,
        right: -7,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#1292E6',
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        elevation: 2,
    },
    multiImgAddBtn: {
        marginLeft: 10,
        marginRight: 4,
    },
    notesRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        marginBottom: 14,
        padding: 12,
    },
    notesBox: {
        backgroundColor: '#E6F1FB',
        borderRadius: 10,
        marginTop: 10,
        padding: 10,
        minHeight: 42,
        justifyContent: 'center',
    },
    notesText: {
        color: '#19233C',
        fontSize: 16,
    },
    signatureRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        marginBottom: 10,
        padding: 12,
    },
    signatureBox: {
        backgroundColor: '#E6F1FB',
        borderRadius: 10,
        marginTop: 10,
        padding: 5,
        minHeight: 60,
        minWidth: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    signatureImg: {
        width: 110,
        height: 38,
        borderRadius: 6,
    },
    signatureOverlay: {
        position: 'absolute',
        top: 4,
        right: 8,
    },
    submitBar: {
        backgroundColor: '#F7F9FC',
        paddingVertical: 20,
        paddingHorizontal: 12,
        borderTopWidth: 0,
        shadowColor: '#0002',
        shadowOpacity: 0.06,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: -2 },
        elevation: 6,
    },
    submitBtn: {
        backgroundColor: '#19BC51',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});