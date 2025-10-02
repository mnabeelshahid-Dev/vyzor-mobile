import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDefinitionSections } from '../../api/statistics';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import CamaraIcon from '../../assets/svgs/camaraIcon.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import Signiture from '../../assets/svgs/segnitureImage.svg'
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_RADIUS = 16;

// Responsive scaling helper (based on iPhone 14 Pro width, 390)
const getResponsive = (val: number) => Math.round(val * (width / 390));

const Radio = ({ selected }: { selected: boolean }) => (
    <View
        style={{
            width: getResponsive(16),
            height: getResponsive(16),
            borderRadius: getResponsive(14),
            borderWidth: 2,
            borderColor: selected ? '#1292E6' : '#19233C',
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: getResponsive(4),
        }}
    >
        {selected ? (
            <View
                style={{
                    width: getResponsive(8),
                    height: getResponsive(8),
                    borderRadius: getResponsive(7),
                    backgroundColor: '#1292E6',
                }}
            />
        ) : null}
    </View>
);

const CameraIcon = () => (
    <View
        style={{
            width: getResponsive(46),
            height: getResponsive(46),
            borderRadius: getResponsive(23),
            backgroundColor: '#1292E6',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <CamaraIcon width={getResponsive(28)} height={getResponsive(28)} />
    </View>
);

const RefreshIcon = () => (
    <View
        style={{
            width: getResponsive(16),
            height: getResponsive(16),
            borderRadius: getResponsive(14),
            backgroundColor: '#1292E6',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: -2,
            right: -6,
        }}
    >
        <Text style={{ color: '#ffff', fontWeight: 'bold', fontSize: getResponsive(12), alignSelf: 'center', bottom: 2 }}>↻</Text>
    </View>
);

export default function SectionsScreen({ navigation }: { navigation: any }) {
    // Get formDefinitionId, status, and sourceScreen from route params
    const route = useRoute();
    const { formDefinitionId = "", status = "", sourceScreen = "" }: any = route.params || {};

    // Fetch sections from API (moved to statistics.ts)
    // import fetchDefinitionSections from statistics.ts

    const {
        data: sectionData,
        isLoading: isSectionsLoading,
        isError: isSectionsError,
        refetch: refetchSections,
    } = useQuery({
        queryKey: ['definitionSections', formDefinitionId, status],
        queryFn: () => fetchDefinitionSections({ formDefinitionId, status }),
        enabled: !!formDefinitionId,
    });
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
                selectionLimit: 5,
                mediaType: 'photo',
            },
            response => {
                if (response.assets && response.assets.length > 0) {
                    const newImgs = response.assets
                        .filter(a => a.uri)
                        .map(a => ({ uri: a.uri as string, id: a.fileName || a.uri || Math.random().toString() }));
                    setImages(prev =>
                        [...prev, ...newImgs].slice(0, 5)
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => {
                        // Navigate back to the source screen
                        if (sourceScreen === 'Schedule') {
                            navigation.navigate('Main', { screen: 'Schedule' });
                        } else {
                            navigation.goBack();
                        }
                    }}>
                        <BackArrowIcon width={getResponsive(16)} height={getResponsive(16)} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sections</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                        <Text style={{ color: '#fff', fontSize: getResponsive(14), fontWeight: '400', marginRight: 4 }}>
                            Scanning
                        </Text>
                        <View
                            style={{
                                width: getResponsive(10),
                                height: getResponsive(10),
                                borderRadius: getResponsive(6),
                                backgroundColor: '#F44336',
                            }}
                        />
                    </View>
                </View>
            </View>
            {/* Task Summary Card */}
            <View style={styles.topCardFloatWrap}>
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
            </View>
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#F2F2F2',
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    paddingTop: getResponsive(60),
                    marginTop: -getResponsive(50),
                }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: getResponsive(30), paddingHorizontal: 0 }}
                    showsVerticalScrollIndicator={false}
                >
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
                                paddingHorizontal: getResponsive(16),
                                paddingTop: getResponsive(16),
                                paddingBottom: getResponsive(10),
                                borderBottomColor: '#ECECEC',
                                borderBottomWidth: 1,
                            }}
                        >
                            <Text style={styles.formCardTitle}>Opening Checks</Text>
                            <View style={{ flex: 1 }} />
                            <Text style={styles.formCardTitle}>
                                <Text style={{ fontWeight: '600' }}>2</Text> of 2
                            </Text>
                        </View>
                        {/* Checklist */}
                        <View style={{ paddingHorizontal: getResponsive(10), paddingVertical: getResponsive(10) }}>
                            {checklist.map((item, idx) => {
                                if (item.type === 'radio') {
                                    const value = answers[item.key as keyof typeof answers];
                                    return (
                                        <View key={item.key} style={styles.radioRow}>
                                            <Text style={styles.radioLabel}>{item.question}</Text>
                                            <View style={styles.radioChoiceRow}>
                                                <TouchableOpacity
                                                    style={styles.radioOption}
                                                    activeOpacity={0.8}
                                                    onPress={() => setAnswers(a => ({ ...a, [item.key]: true }))}
                                                >
                                                    <Radio selected={value === true} />
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        value === true && { color: '#1292E6' }
                                                    ]}>YES</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.radioOption}
                                                    activeOpacity={0.8}
                                                    onPress={() => setAnswers(a => ({ ...a, [item.key]: false }))}
                                                >
                                                    <Radio selected={value === false} />
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        value === false && { color: '#1292E6' }
                                                    ]}>NO</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }
                                if (item.type === 'images') {
                                    return (
                                        <View key={item.key} style={styles.mediaRow}>
                                            <View style={{ width: '50%', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: getResponsive(13) }}>{item.label}</Text>
                                            </View>
                                            <View style={styles.multiImgBox}>
                                                {images.map(img => (
                                                    <View key={img.id} style={styles.multiImgThumbBox}>
                                                        <Image source={{ uri: img.uri }} style={styles.multiImgThumb} />
                                                        <TouchableOpacity
                                                            style={styles.multiImgRemove}
                                                            onPress={() => handleRemoveImage(img.id)}
                                                        >
                                                            <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: getResponsive(10) }}>✕</Text>
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
                                            <Text style={{
                                                color: '#19233C',
                                                fontSize: getResponsive(12),
                                                marginBottom: getResponsive(10),
                                                lineHeight: getResponsive(16),
                                                backgroundColor: '#F7F9FC',
                                                width: '50%',
                                            }}>{item.question}</Text>
                                            <View style={styles.notesBox}>
                                                <Text style={styles.notesText}>{answers[item.key as keyof typeof answers]}</Text>
                                            </View>
                                        </View>
                                    );
                                }
                                if (item.type === 'signature') {
                                    return (
                                        <View key={item.key} style={styles.signatureRow}>
                                            <Text style={{
                                                color: '#19233C',
                                                fontSize: getResponsive(12),
                                                marginBottom: getResponsive(10),
                                                lineHeight: getResponsive(16),
                                                backgroundColor: '#F7F9FC',
                                                width: '60%',
                                                alignSelf: 'center',
                                            }}>{item.label}</Text>
                                            <View style={styles.signatureBox}>
                                                <Signiture
                                                    width={styles.signatureImg.width}
                                                    height={styles.signatureImg.height}
                                                    style={styles.signatureImg}
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
            </View>
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
        backgroundColor: '#007AFF',
        paddingTop: Platform.OS === 'ios' ? getResponsive(18) : getResponsive(55),
        paddingBottom: getResponsive(14),
        paddingHorizontal: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 0,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: getResponsive(24),
    },
    headerTitle: {
        color: '#fff',
        fontSize: getResponsive(20),
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    topCardFloatWrap: {
        alignItems: 'center',
        width: '100%',
        zIndex: 2,
        paddingHorizontal: getResponsive(16),
    },
    topCard: {
        backgroundColor: '#fff',
        borderRadius: getResponsive(14),
        padding: getResponsive(10),
        width: '100%',
        shadowColor: '#0002',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: getResponsive(8),
    },
    topCardTitle: {
        color: '#222E44',
        fontWeight: '700',
        fontSize: getResponsive(16),
    },
    topCardSub: {
        color: '#7A8194',
        fontWeight: '500',
        fontSize: getResponsive(12),
    },
    dot: {
        color: '#7A8194',
        fontSize: getResponsive(18),
        marginHorizontal: 2,
        marginRight: getResponsive(8),
    },
    topCardDate: {
        fontSize: getResponsive(14),
        color: '#7A8194',
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: CARD_RADIUS,
        marginHorizontal: getResponsive(12),
        shadowColor: '#0002',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: getResponsive(20),
    },
    formCardTitle: {
        color: '#19233C',
        fontSize: getResponsive(16),
        fontWeight: '600',
    },
    radioRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(14),
        paddingHorizontal: getResponsive(10),
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    radioLabel: {
        color: '#19233C',
        fontSize: getResponsive(12),
        marginBottom: getResponsive(10),
        lineHeight: getResponsive(16),
        backgroundColor: '#F7F9FC',
        width: '60%',

    },
    radioChoiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        width: '40%',
        justifyContent: 'flex-end',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: getResponsive(10),
        // marginRight: getResponsive(24),
    },
    radioOptionText: {
        color: '#19233C',
        fontSize: getResponsive(12),
        marginHorizontal: getResponsive(2),
    },
    mediaRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(14),
        padding: getResponsive(16),
        flexDirection: 'row',
        // backgroundColor: 'red',
    },
    multiImgBox: {
        backgroundColor: '#0088E733',
        borderRadius: getResponsive(6),
        marginTop: getResponsive(8),
        padding: getResponsive(8),
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '50%',
        // minHeight: getResponsive(90),
    },
    multiImgThumbBox: {
        marginRight: getResponsive(8),
        marginBottom: getResponsive(4),
        position: 'relative',
    },
    multiImgThumb: {
        width: getResponsive(60),
        height: getResponsive(50),
        borderRadius: getResponsive(10),
        backgroundColor: '#bbb',
        marginBottom: getResponsive(4),
    },
    multiImgRemove: {
        position: 'absolute',
        top: -7,
        right: -7,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#1292E6',
        borderRadius: getResponsive(14),
        width: getResponsive(20),
        height: getResponsive(20),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        elevation: 2,
    },
    multiImgAddBtn: {
        marginLeft: getResponsive(10),
        marginRight: getResponsive(4),
    },
    notesRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(14),
        padding: getResponsive(16),
        flexDirection: 'row',
    },
    notesBox: {
        backgroundColor: '#0088E733',
        borderRadius: getResponsive(6),
        marginTop: getResponsive(8),
        padding: getResponsive(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        width: '50%',
        marginLeft: 5,
    },
    notesText: {
        color: '#19233C',
        fontSize: getResponsive(10),
        fontWeight: '500',
    },
    signatureRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(10),
        padding: getResponsive(16),
        flexDirection: 'row',
    },
    signatureBox: {
        backgroundColor: '#0088E733',
        borderRadius: getResponsive(10),
        marginTop: getResponsive(10),
        padding: getResponsive(5),
        minHeight: getResponsive(60),
        minWidth: getResponsive(120),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    signatureImg: {
        width: getResponsive(110),
        height: getResponsive(38),
        borderRadius: getResponsive(6),
    },
    signatureOverlay: {
        position: 'absolute',
        top: 4,
        right: 8,
    },
    submitBar: {
        backgroundColor: '#fff',
        paddingVertical: getResponsive(20),
        paddingHorizontal: getResponsive(12),
        borderTopWidth: 0,
        shadowColor: '#0002',
        shadowOpacity: 0.06,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: -2 },
        elevation: 6,
    },
    submitBtn: {
        backgroundColor: '#28B446',
        borderRadius: getResponsive(10),
        paddingVertical: getResponsive(7),
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: getResponsive(16),
        fontWeight: '600',
        letterSpacing: 0.8,
    },
});