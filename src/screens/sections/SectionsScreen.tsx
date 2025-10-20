import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchSectionRows, syncDocument, fetchLookupOptions } from '../../api/statistics';
import Signature from 'react-native-signature-canvas';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    StatusBar,
    TextInput,
    Alert,
    Modal,
    ActionSheetIOS

} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera } from 'react-native-camera-kit';
import CamaraIcon from '../../assets/svgs/camaraIcon.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import RefreshSignatureIcon from '../../assets/svgs/RefreshSignature.svg';
import { useRoute } from '@react-navigation/native';
import { showErrorToast, showSuccessToast } from '../../components';

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
            borderColor: selected ? '#0088E7' : '#19233C',
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
                    backgroundColor: '#0088E7',
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

const Checkbox = ({ selected }: { selected: boolean }) => (
    <View
        style={{
            width: getResponsive(16),
            height: getResponsive(16),
            borderRadius: getResponsive(3),
            borderWidth: 2,
            borderColor: selected ? '#0088E7' : '#19233C',
            backgroundColor: selected ? '#0088E7' : '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: getResponsive(4),
        }}
    >
        {selected ? (
            <Text style={{ color: '#fff', fontSize: getResponsive(10), fontWeight: 'bold' }}>✓</Text>
        ) : null}
    </View>
);

const Switch = ({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) => (
    <TouchableOpacity
        style={{
            width: getResponsive(44),
            height: getResponsive(24),
            borderRadius: getResponsive(12),
            backgroundColor: value ? '#0088E7' : '#E5E5E5',
            justifyContent: 'center',
            paddingHorizontal: getResponsive(2),
            marginLeft: getResponsive(4),
        }}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.8}
    >
        <View
            style={{
                width: getResponsive(20),
                height: getResponsive(20),
                borderRadius: getResponsive(10),
                backgroundColor: '#fff',
                alignSelf: value ? 'flex-end' : 'flex-start',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        />
    </TouchableOpacity>
);

export default function SectionsScreen({ navigation }: { navigation: any }) {
    // Get formDefinitionId, status, and sourceScreen from route params
    const route = useRoute();
    const {
        formSectionIds = {},
        data,
        formConfigurationSectionIds = {},
    }: any = route.params || {};
    const {
        formName = "",
        startDate = "",
        endDate = "",
        documentId = "",
        formDefinitionId = "",
        assignUserId = "",
        clientId = "",
        siteId = ""
    } = data || {};


    console.log("formSectionIds", formSectionIds);
    console.log("formConfigurationSectionIds", formConfigurationSectionIds);
    


    // Mutation for document sync
    const syncMutation = useMutation({
        mutationFn: async (body: any) => syncDocument(documentId, body),
        onSuccess: () => {
            showSuccessToast('Document synced successfully!', 'Your document has been saved.');
        },
        onError: (error: any) => {
            const status = error?.response?.status ?? error?.status ?? 'n/a';
            const message =
                error?.response?.data?.message ||
                (typeof error?.response?.data === 'string' ? error.response.data : null) ||
                error?.message ||
                'Request failed';
            console.log('[SectionsScreen] Document sync failed:', { status, message, data: error?.response?.data });
            showErrorToast(`Sync failed (HTTP ${status})`, message);
        },
    });

    const [rowImages, setRowImages] = useState<{ [rowId: string]: Array<{ uri: string, id: string }> }>({});
    const [textInputs, setTextInputs] = useState<{ [key: string]: string }>({});
    const [checkboxValues, setCheckboxValues] = useState<{ [key: string]: boolean }>({});
    const [switchValues, setSwitchValues] = useState<{ [key: string]: boolean }>({});
    const [textAreaInputs, setTextAreaInputs] = useState<{ [key: string]: string }>({});
    const [dateValues, setDateValues] = useState<{ [key: string]: string }>({});
    const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({});
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [ratingValues, setRatingValues] = useState<{ [key: string]: number }>({});
    const [lookupValues, setLookupValues] = useState<{ [key: string]: string }>({});
    const [lookupOptions, setLookupOptions] = useState<{ [key: string]: Array<{ value: string; text: string }> }>({});
    const [signatureValues, setSignatureValues] = useState<{ [rowId: string]: { encoded?: string; pathName?: string } }>({});
    const [qrCodeValues, setQrCodeValues] = useState<{ [key: string]: string }>({});
    const [showQrScanner, setShowQrScanner] = useState<{ [key: string]: boolean }>({});
    const [qrValidatorValues, setQrValidatorValues] = useState<{ [key: string]: string }>({});
    const [qrValidatorStatus, setQrValidatorStatus] = useState<{ [key: string]: 'pending' | 'valid' | 'invalid' }>({});
    const [showQrValidatorScanner, setShowQrValidatorScanner] = useState<{ [key: string]: boolean }>({});
    // replace single ref with a map of refs and helpers
    const signatureRefs = useRef<{ [rowId: string]: any }>({});
    const signatureWaiters = useRef<{ [rowId: string]: (res: { pathName: string; encoded: string }) => void }>({});
    const signatureSaveTimers = useRef<{ [rowId: string]: any }>({});
    const signatureRowIdsRef = useRef<Set<string>>(new Set());

    // const handleAddImages = async (rowId: string) => {
    //     launchImageLibrary(
    //         { selectionLimit: 5, mediaType: 'photo' },
    //         response => {
    //             if (response.assets && response.assets.length > 0) {
    //                 const newImgs = response.assets
    //                     .filter(a => a.uri)
    //                     .map(a => ({ uri: a.uri as string, id: a.fileName || a.uri || Math.random().toString() }));
    //                 setRowImages(prev => ({
    //                     ...prev,
    //                     [rowId]: [...(prev[rowId] || []), ...newImgs].slice(0, 5)
    //                 }));
    //             }
    //         }
    //     );
    // };

    async function ensureAllSignaturesSaved() {
        const rowIds = Array.from(signatureRowIdsRef.current);
        const toCapture = rowIds.filter(id => !signatureValues[id]?.encoded);
        if (toCapture.length === 0) return;

        await Promise.all(
            toCapture.map(
                (rowId) =>
                    new Promise<void>((resolve) => {
                        const ref = signatureRefs.current[rowId];
                        if (!ref) return resolve();
                        signatureWaiters.current[rowId] = () => resolve();
                        // react-native-signature-canvas → triggers onOK
                        ref.readSignature();
                    })
            )
        );
    }

    const handleAddImages = async (rowId: string) => {
        const remaining = Math.max(1, 5 - (rowImages[rowId]?.length || 0));

        const fromCamera = async () => {
            const res = await launchCamera({
                mediaType: 'photo',
                saveToPhotos: true,
                cameraType: 'back',
            });
            if (res.assets?.length) {
                const newImgs = res.assets
                    .filter(a => a.uri)
                    .map(a => ({ uri: a.uri as string, id: a.fileName || a.uri || Math.random().toString() }));
                setRowImages(prev => ({
                    ...prev,
                    [rowId]: [...(prev[rowId] || []), ...newImgs].slice(0, 5),
                }));
            }
        };

        const fromLibrary = async () => {
            const res = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: remaining,
            });
            if (res.assets?.length) {
                const newImgs = res.assets
                    .filter(a => a.uri)
                    .map(a => ({ uri: a.uri as string, id: a.fileName || a.uri || Math.random().toString() }));
                setRowImages(prev => ({
                    ...prev,
                    [rowId]: [...(prev[rowId] || []), ...newImgs].slice(0, 5),
                }));
            }
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) fromCamera();
                    if (buttonIndex === 2) fromLibrary();
                }
            );
        } else {
            Alert.alert(
                'Add Photo',
                undefined,
                [
                    { text: 'Take Photo', onPress: fromCamera },
                    { text: 'Choose from Library', onPress: fromLibrary },
                    { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
            );
        }
    };

    const handleRemoveImage = (rowId: string, imgId: string) => {
        setRowImages(prev => ({
            ...prev,
            [rowId]: (prev[rowId] || []).filter(img => img.id !== imgId)
        }));
    };

    const {
        data: sectionRowsData,
        isLoading: isSectionRowsLoading,
        isError: isSectionRowsError,
        refetch: refetchSectionRows,
    } = useQuery({
        queryKey: ['sectionRows', formSectionIds.id1],
        queryFn: () => formSectionIds.id1 ? fetchSectionRows(formSectionIds.id1) : Promise.resolve([]),
        enabled: !!formSectionIds.id1,
    });


    // Fetch lookup options for all LOOKUP controls
    React.useEffect(() => {
        if (!sectionRowsData?.data) return;

        const rows = Array.isArray(sectionRowsData.data) ? sectionRowsData.data : [sectionRowsData.data];

        rows.forEach((row: any) => {
            row.columns?.forEach((col: any) => {
                col.components?.forEach((comp: any) => {
                    if (comp.component === 'LOOKUP' && comp.text) {
                        const lookupName = comp.text;
                        const rowId = row.webId;

                        // Only fetch if we haven't already
                        if (!lookupOptions[rowId]) {
                            fetchLookupOptions(lookupName)
                                .then((response) => {
                                    if (response?.data) {
                                        setLookupOptions(prev => ({
                                            ...prev,
                                            [rowId]: response.data
                                        }));
                                    }
                                })
                                .catch((error) => {
                                    console.error(`Failed to fetch lookup options for ${lookupName}:`, error);
                                });
                        }
                    }
                });
            });
        });
    }, [sectionRowsData]);



    const filteredList = (() => {
        const rows = Array.isArray(sectionRowsData?.data) ? sectionRowsData.data : (sectionRowsData?.data || []);
        if (!rows || rows.length === 0) return [];
        return [{
            webId: formSectionIds.id1,
            name: data?.sectionName || formName || 'Section',
            formSectionRowModels: rows,
        }];
    })();

    console.log('====================================');
    console.log('Rendering SectionsScreen with data:', { filteredList });
    console.log('====================================');

    // Submission handler

    function formatDateTimeUTC(date: Date | string) {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}Z`;
    }

    function formatToUTC(date) {
        return date.toISOString().split('.')[0] + 'Z';
    }

    const handleSubmit = async () => {
        await ensureAllSignaturesSaved();

        const sectionModels = filteredList.map((section: any) => {
            return {
                startDate: formatDateTimeUTC(startDate || new Date()),
                endDate: formatDateTimeUTC(endDate || new Date()),
                key: section.key || section.webId || '',
                formConfigurationSectionId: formConfigurationSectionIds.id1 || 0,
                documentId: documentId,
                userId: assignUserId,
                data: (section.formSectionRowModels || []).flatMap((row: any) => {
                    const comps = row.columns?.flatMap((col: any) => col.components || []) || [];

                    // RADIO_BUTTON (only include the selected one)
                    const answer = answers[section.webId]?.[row.webId];
                    const radioData =
                        comps
                            .filter((c: any) => c.component === 'RADIO_BUTTON')
                            .map((c: any) => ({
                                value: answer === c.text ? c.text : '',
                                controlId: c.webId,
                                groupName: c.groupName || null,
                                senserData: null,
                            }))
                            .filter((i: any) => i.value) || [];

                    // CAMERA (array of IDs)
                    const cameraComp = comps.find((c: any) => c.component === 'CAMERA');
                    const cameraData = cameraComp
                        ? [{
                            value: (rowImages[row.webId] || []).map(img => img.id),
                            controlId: cameraComp.webId || '',
                            groupName: cameraComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // ATTACHEMENTS (array of IDs, same source as camera in this UI)
                    const attachComp = comps.find((c: any) => c.component === 'ATTACHEMENTS');
                    const attachmentsData = attachComp
                        ? [{
                            value: (rowImages[row.webId] || []).map(img => img.id),
                            controlId: attachComp.webId || '',
                            groupName: attachComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // TEXT_FIELD
                    const textComp = comps.find((c: any) => c.component === 'TEXT_FIELD');
                    const textVal = textInputs[row.webId] || '';
                    const textData = textComp
                        ? [{
                            value: textVal,
                            controlId: textComp.webId,
                            groupName: textComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // CHECK_BOX (boolean)
                    const checkboxComp = comps.find((c: any) => c.component === 'CHECK_BOX');
                    const checkboxVal = checkboxValues[row.webId] ?? false;
                    const checkboxData = checkboxComp
                        ? [{
                            value: checkboxVal,
                            controlId: checkboxComp.webId,
                            groupName: checkboxComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // SWITCH_BUTTON (boolean)
                    const switchComp = comps.find((c: any) => c.component === 'SWITCH_BUTTON');
                    const switchVal = switchValues[row.webId] ?? false;
                    const switchData = switchComp
                        ? [{
                            value: switchVal,
                            controlId: switchComp.webId,
                            groupName: switchComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // TEXT_AREA
                    const textAreaComp = comps.find((c: any) => c.component === 'TEXT_AREA');
                    const textAreaVal = textAreaInputs[row.webId] || '';
                    const textAreaData = textAreaComp
                        ? [{
                            value: textAreaVal,
                            controlId: textAreaComp.webId,
                            groupName: textAreaComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // DATE (YYYY-MM-DD)
                    const dateComp = comps.find((c: any) => c.component === 'DATE');
                    const dateVal = dateValues[row.webId] || '';
                    const dateData = dateComp
                        ? [{
                            value: dateVal,
                            controlId: dateComp.webId,
                            groupName: dateComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // RATING (number)
                    const ratingComp = comps.find((c: any) => c.component === 'RATING');
                    const ratingVal = ratingValues[row.webId] ?? 0;
                    const ratingData = ratingComp
                        ? [{
                            value: Number(ratingVal),
                            controlId: ratingComp.webId,
                            groupName: ratingComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // LOOKUP
                    const lookupComp = comps.find((c: any) => c.component === 'LOOKUP');
                    const lookupVal = lookupValues[row.webId] || '';
                    const lookupData = lookupComp
                        ? [{
                            value: lookupVal,
                            controlId: lookupComp.webId,
                            groupName: lookupComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // SIGNATURE (base64 without data: prefix)
                    const signatureComp = comps.find((c: any) => c.component === 'SIGNATURE');
                    const signatureVal = signatureValues[row.webId]?.encoded || '';
                    const signatureData = signatureComp
                        ? [{
                            value: signatureVal,
                            controlId: signatureComp.webId,
                            groupName: signatureComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // QR_CODE (scanned value)
                    const qrCodeComp = comps.find((c: any) => c.component === 'QR_CODE');
                    const qrCodeVal = qrCodeValues[row.webId] || '';
                    const qrCodeData = qrCodeComp
                        ? [{
                            value: qrCodeVal,
                            controlId: qrCodeComp.webId,
                            groupName: qrCodeComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // QR_VALIDATOR (scanned value with validation status)
                    const qrValidatorComp = comps.find((c: any) => c.component === 'QR_VALIDATOR');
                    const qrValidatorVal = qrValidatorValues[row.webId] || '';
                    const qrValidatorData = qrValidatorComp
                        ? [{
                            value: qrValidatorVal,
                            controlId: qrValidatorComp.webId,
                            groupName: qrValidatorComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    return [
                        ...radioData,
                        ...attachmentsData,
                        ...cameraData,
                        ...textData,
                        ...checkboxData,
                        ...switchData,
                        ...textAreaData,
                        ...dateData,
                        ...ratingData,
                        ...lookupData,
                        ...signatureData,
                        ...qrCodeData,
                        ...qrValidatorData,
                    ];
                }),
            };
        });

        const body = {
            formDefinitionId,
            status: 'COMPLETED',
            userAccountId: assignUserId,
            clientId,
            siteId,
            flow: 0,
            deleted: false,
            completedDate: formatToUTC(new Date()),
            sectionModels,
        };

        console.log('[SectionsScreen] Submitting body:', JSON.stringify(body, null, 2));

        syncMutation.mutate(body, {
            onSuccess: (data: any) => {
                showSuccessToast('Document synced successfully!', 'Your document has been saved.');
                navigation.goBack();
                console.log('[SectionsScreen] Backend full response:', data);
            },
            onError: (error: any) => {
                console.log('[SectionsScreen] Backend error (full):', error);
                if (error?.response) {
                    console.log('[SectionsScreen] Backend error response data:', error.response.data);
                    console.log('[SectionsScreen] Backend error response status:', error.response.status);
                    console.log('[SectionsScreen] Backend error response headers:', error.response.headers);
                }
            },
        });
    };


    function formatDateTime(dateString: any) {
        const date = new Date(dateString);

        // Get date parts
        const month = date.getMonth() + 1; // months are 0-based
        const day = date.getDate();
        const year = date.getFullYear();

        // Get time parts
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 0 becomes 12

        // Pad minutes with leading 0 if needed
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        return `${month}/${day}/${year} ${hours}:${minutesStr}${ampm}`;
    }

    const [answers, setAnswers] = useState<{ [sectionId: string]: { [rowId: string]: string } }>({});
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const currentSection = filteredList[currentSectionIdx] || null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0088E7' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#0088E7" />
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => {
                        navigation.goBack();

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
                        <Text style={styles.topCardTitle}>{formName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.topCardSub}>{documentId}</Text>
                        <Text style={styles.dot}>|</Text>
                        <Text style={styles.topCardSub}>In-Progress</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.topCardDate}>{formatDateTime(startDate)}</Text>
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
                    {currentSection && (
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
                                <Text style={styles.formCardTitle}>{currentSection.name}</Text>
                                <View style={{ flex: 1 }} />
                                <Text style={styles.formCardTitle}>
                                    <Text style={{ fontWeight: '600' }}>{currentSectionIdx + 1}</Text> of {filteredList.length}
                                </Text>
                            </View>
                            {/* Checklist */}
                            <View style={{ paddingHorizontal: getResponsive(10), paddingVertical: getResponsive(10) }}>
                                {currentSection.formSectionRowModels.map((row, rIdx) => {
                                    const isLastRow = rIdx === currentSection.formSectionRowModels.length - 1;
                                    const hasCamera = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'CAMERA')
                                    );
                                    // TEXT_FIELD row
                                    const hasTextField = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'TEXT_FIELD')
                                    );
                                    const hasSignature = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'SIGNATURE')
                                    );

                                    if (hasTextField) {
                                        const textComp = row.columns.flatMap(c => c.components).find(c => c.component === 'TEXT_FIELD');
                                        const placeholder = textComp?.placeholder || 'Type your answer...';

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={styles.radioLabel}>{row.columns[0]?.components[0]?.text}</Text>
                                                </View>
                                                <View style={[styles.textFieldBox, { width: '50%' }]}>
                                                    <TextInput
                                                        style={styles.textFieldInput}
                                                        multiline
                                                        value={textInputs[row.webId] || ''}
                                                        onChangeText={(v) =>
                                                            setTextInputs(prev => ({ ...prev, [row.webId]: v }))
                                                        }
                                                        placeholder={placeholder}
                                                        placeholderTextColor="#02163980"
                                                    />
                                                </View>
                                            </View>
                                        );
                                    }

                                    // CHECK_BOX row
                                    const hasCheckbox = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'CHECK_BOX')
                                    );
                                    if (hasCheckbox) {
                                        const checkboxComp = row.columns.flatMap(c => c.components).find(c => c.component === 'CHECK_BOX');
                                        const isChecked = checkboxValues[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.radioChoiceRow}
                                                    activeOpacity={0.8}
                                                    onPress={() => {
                                                        setCheckboxValues(prev => ({
                                                            ...prev,
                                                            [row.webId]: !isChecked
                                                        }));
                                                    }}
                                                >
                                                    <Checkbox selected={isChecked} />
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        isChecked && {
                                                            color: '#0088E7',
                                                            fontWeight: 'bold',
                                                        }
                                                    ]}>
                                                        {isChecked ? 'Yes' : 'No'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }

                                    // SWITCH_BUTTON row
                                    const hasSwitch = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'SWITCH_BUTTON')
                                    );
                                    if (hasSwitch) {
                                        const switchValue = switchValues[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <View style={styles.radioChoiceRow}>
                                                    <Switch
                                                        value={switchValue}
                                                        onValueChange={(value) => {
                                                            setSwitchValues(prev => ({
                                                                ...prev,
                                                                [row.webId]: value
                                                            }));
                                                        }}
                                                    />
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        switchValue && {
                                                            color: '#0088E7',
                                                            fontWeight: 'bold',
                                                        }
                                                    ]}>
                                                        {switchValue ? 'On' : 'Off'}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    }

                                    // TEXT_AREA row
                                    const hasTextArea = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'TEXT_AREA')
                                    );
                                    if (hasTextArea) {
                                        const textAreaComp = row.columns.flatMap(c => c.components).find(c => c.component === 'TEXT_AREA');
                                        const placeholder = textAreaComp?.placeholder || 'Type your comments...';

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={styles.radioLabel}>{row.columns[0]?.components[0]?.text}</Text>
                                                </View>
                                                <View style={[styles.textFieldBox, { width: '50%' }]}>
                                                    <TextInput
                                                        style={[styles.textFieldInput, { minHeight: getResponsive(80) }]}
                                                        multiline
                                                        numberOfLines={4}
                                                        value={textAreaInputs[row.webId] || ''}
                                                        onChangeText={(v) =>
                                                            setTextAreaInputs(prev => ({ ...prev, [row.webId]: v }))
                                                        }
                                                        placeholder={placeholder}
                                                        placeholderTextColor="#02163980"
                                                        textAlignVertical="top"
                                                    />
                                                </View>
                                            </View>
                                        );
                                    }

                                    // DATE row
                                    const hasDate = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'DATE')
                                    );
                                    if (hasDate) {
                                        const dateValue = dateValues[row.webId] || '';
                                        const showPicker = showDatePicker[row.webId] || false;

                                        const handleDateChange = (event: any, selectedDate?: Date) => {
                                            setShowDatePicker(prev => ({ ...prev, [row.webId]: false }));
                                            if (selectedDate) {
                                                const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
                                                setDateValues(prev => ({ ...prev, [row.webId]: formattedDate }));
                                            }
                                        };

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.radioChoiceRow}
                                                    activeOpacity={0.8}
                                                    onPress={() => {
                                                        setShowDatePicker(prev => ({ ...prev, [row.webId]: true }));
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        {
                                                            backgroundColor: '#D8ECFA',
                                                            paddingHorizontal: getResponsive(8),
                                                            paddingVertical: getResponsive(4),
                                                            borderRadius: getResponsive(6),
                                                            minWidth: getResponsive(100),
                                                            textAlign: 'center'
                                                        }
                                                    ]}>
                                                        {dateValue || 'Select Date'}
                                                    </Text>
                                                </TouchableOpacity>
                                                {showPicker && (
                                                    <DateTimePicker
                                                        value={dateValue ? new Date(dateValue) : new Date()}
                                                        mode="date"
                                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                        onChange={handleDateChange}
                                                    />
                                                )}
                                            </View>
                                        );
                                    }

                                    const hasRating = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'RATING')
                                    );


                                    // RATING row
                                    if (hasRating) {
                                        const ratingComp = row.columns.flatMap(c => c.components).find(c => c.component === 'RATING');
                                        const currentRating = ratingValues[row.webId] || 0;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <View style={styles.radioChoiceRow}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <TouchableOpacity
                                                            key={star}
                                                            onPress={() => {
                                                                setRatingValues(prev => ({
                                                                    ...prev,
                                                                    [row.webId]: star
                                                                }));
                                                            }}
                                                            activeOpacity={0.7}
                                                            style={{ marginHorizontal: getResponsive(4) }}
                                                        >
                                                            <Text style={{
                                                                fontSize: getResponsive(24),
                                                                color: star <= currentRating ? '#FFB800' : '#E0E0E0'
                                                            }}>
                                                                ★
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        );
                                    }


                                    const hasLookup = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'LOOKUP')
                                    );

                                    // LOOKUP row
                                    if (hasLookup) {
                                        const lookupComp = row.columns.flatMap(c => c.components).find(c => c.component === 'LOOKUP');
                                        const options = lookupOptions[row.webId] || [];
                                        const selectedValue = lookupValues[row.webId] || '';
                                        const selectedText = options.find(opt => opt.value === selectedValue)?.text || 'Select an option';
                                        const [showLookupModal, setShowLookupModal] = useState(false);

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={styles.radioLabel}>
                                                        {row.columns[0]?.components[0]?.text}
                                                    </Text>
                                                </View>
                                                <View style={{ width: '50%' }}>
                                                    <TouchableOpacity
                                                        style={[styles.textFieldBox, {
                                                            paddingVertical: getResponsive(12),
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }]}
                                                        onPress={() => setShowLookupModal(true)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={[
                                                            styles.textFieldInput,
                                                            !selectedValue && { color: '#02163980' }
                                                        ]}>
                                                            {selectedText}
                                                        </Text>
                                                        <Text style={{ color: '#021639', fontSize: getResponsive(12) }}>▼</Text>
                                                    </TouchableOpacity>

                                                    {/* Lookup Modal */}
                                                    <Modal
                                                        visible={showLookupModal}
                                                        transparent
                                                        animationType="fade"
                                                        onRequestClose={() => setShowLookupModal(false)}
                                                    >
                                                        <View style={styles.lookupModalOverlay}>
                                                            <View style={styles.lookupModalContent}>
                                                                <View style={styles.lookupModalHeader}>
                                                                    <Text style={styles.lookupModalTitle}>
                                                                        {row.columns[0]?.components[0]?.text}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        onPress={() => setShowLookupModal(false)}
                                                                        style={styles.lookupModalClose}
                                                                    >
                                                                        <Text style={styles.lookupModalCloseText}>✕</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <ScrollView style={styles.lookupModalScroll}>
                                                                    {options.map((option) => (
                                                                        <TouchableOpacity
                                                                            key={option.value}
                                                                            style={[
                                                                                styles.lookupOption,
                                                                                selectedValue === option.value && styles.lookupOptionSelected
                                                                            ]}
                                                                            onPress={() => {
                                                                                setLookupValues(prev => ({
                                                                                    ...prev,
                                                                                    [row.webId]: option.value
                                                                                }));
                                                                                setShowLookupModal(false);
                                                                            }}
                                                                            activeOpacity={0.7}
                                                                        >
                                                                            <Text style={[
                                                                                styles.lookupOptionText,
                                                                                selectedValue === option.value && styles.lookupOptionTextSelected
                                                                            ]}>
                                                                                {option.text}
                                                                            </Text>
                                                                            {selectedValue === option.value && (
                                                                                <Text style={styles.lookupOptionCheck}>✓</Text>
                                                                            )}
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </ScrollView>
                                                            </View>
                                                        </View>
                                                    </Modal>
                                                </View>
                                            </View>
                                        );
                                    }

                                    // If it's the last row and Take Pictures → render ONLY media row
                                    if (hasCamera) {
                                        return (
                                            <View
                                                key={row.webId}
                                                style={[styles.mediaRow, { flexDirection: 'row', alignItems: 'center', padding: 0 }]}
                                            >
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={{ fontSize: getResponsive(13), color: '#19233C' }}>Take Pictures</Text>
                                                </View>

                                                <View
                                                    style={[
                                                        styles.multiImgBox,
                                                        { width: '50%', marginTop: 0, marginRight: getResponsive(8) },
                                                    ]}
                                                >
                                                    {(rowImages[row.webId] || []).map(img => (
                                                        <View key={img.id} style={styles.multiImgThumbBox}>
                                                            <TouchableOpacity onPress={() => setPreviewUri(img.uri)}>
                                                                <Image source={{ uri: img.uri }} style={styles.multiImgThumb} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={styles.multiImgRemove}
                                                                onPress={() => handleRemoveImage(row.webId, img.id)}
                                                            >
                                                                <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: getResponsive(10) }}>✕</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}

                                                    <TouchableOpacity
                                                        style={styles.multiImgAddBtn}
                                                        onPress={() => handleAddImages(row.webId)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <CameraIcon />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    }

                                    if (hasSignature) {
                                        signatureRowIdsRef.current.add(row.webId);

                                        return (
                                            <View key={row.webId} style={styles.signatureRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10), justifyContent: 'center' }}>
                                                    <Text style={styles.radioLabel}>{row.columns[0]?.components[0]?.text || 'Signature'}</Text>
                                                </View>

                                                <View style={{ width: '50%', alignItems: 'flex-end', paddingRight: getResponsive(8) }}>
                                                    <View style={[styles.signatureBox, { width: '100%', overflow: 'hidden', height: getResponsive(90) }]}>
                                                        {/* Inline signature canvas using react-native-signature-canvas */}
                                                        <Signature
                                                            ref={(r) => { if (r) signatureRefs.current[row.webId] = r; }}
                                                            onOK={(base64: string) => {
                                                                const encoded = (base64 || '').replace(/^data:image\/\w+;base64,/, '');
                                                                setSignatureValues(prev => ({
                                                                    ...prev,
                                                                    [row.webId]: { encoded, pathName: undefined }
                                                                }));
                                                                if (signatureWaiters.current[row.webId]) {
                                                                    signatureWaiters.current[row.webId]!({ pathName: '', encoded });
                                                                    delete signatureWaiters.current[row.webId];
                                                                }
                                                            }}
                                                            onEnd={() => {
                                                                // Auto-save after pen up
                                                                signatureRefs.current[row.webId]?.readSignature();
                                                            }}
                                                            webStyle={`
                                                                            .m-signature-pad--footer { display:none; }
                                                                            body,html { background: transparent; }
                                                                            .m-signature-pad { box-shadow:none; border:0; background: transparent; }
                                                                            canvas { background-color: transparent; }
                                                                    `}
                                                            backgroundColor="#31AAFF33"
                                                            penColor="#000"
                                                            descriptionText=""
                                                            clearText=""
                                                            confirmText=""
                                                            autoClear={false}
                                                        />

                                                        {/* Clear (↻) icon top-right, like the screenshot */}
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                signatureRefs.current[row.webId]?.clearSignature();
                                                                setSignatureValues(prev => {
                                                                    const { [row.webId]: _, ...rest } = prev;
                                                                    return rest;
                                                                });
                                                            }}
                                                            style={styles.signatureOverlay}
                                                            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                                                        >
                                                            <RefreshSignatureIcon width={getResponsive(16)} height={getResponsive(16)} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    }

                                    // QR_CODE row
                                    const hasQrCode = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'QR_CODE')
                                    );
                                    if (hasQrCode) {
                                        const qrCodeValue = qrCodeValues[row.webId] || '';
                                        const showScanner = showQrScanner[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.radioChoiceRow}
                                                    activeOpacity={0.8}
                                                    onPress={() => {
                                                        setShowQrScanner(prev => ({ ...prev, [row.webId]: true }));
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        {
                                                            backgroundColor: '#D8ECFA',
                                                            paddingHorizontal: getResponsive(8),
                                                            paddingVertical: getResponsive(4),
                                                            borderRadius: getResponsive(6),
                                                            minWidth: getResponsive(100),
                                                            textAlign: 'center'
                                                        }
                                                    ]}>
                                                        {qrCodeValue || 'Scan QR Code'}
                                                    </Text>
                                                </TouchableOpacity>
                                                
                                                {/* QR Code Scanner Modal */}
                                                <Modal
                                                    visible={showScanner}
                                                    transparent={false}
                                                    animationType="slide"
                                                    onRequestClose={() => setShowQrScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                >
                                                    <View style={styles.qrScannerContainer}>
                                                        <View style={styles.qrScannerHeader}>
                                                            <TouchableOpacity
                                                                onPress={() => setShowQrScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                                style={styles.qrScannerClose}
                                                            >
                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.qrScannerTitle}>Scan QR Code</Text>
                                                        </View>
                                                        
                                                        <Camera
                                                            onReadCode={(event: any) => {
                                                                const scannedValue = event.nativeEvent.codeStringValue;
                                                                setQrCodeValues(prev => ({ ...prev, [row.webId]: scannedValue }));
                                                                setShowQrScanner(prev => ({ ...prev, [row.webId]: false }));
                                                                showSuccessToast('QR Code Scanned', `Value: ${scannedValue}`);
                                                            }}
                                                            scanBarcode={true}
                                                            showFrame={true}
                                                            laserColor="red"
                                                            frameColor="white"
                                                            style={styles.qrScannerCamera}
                                                        />
                                                    </View>
                                                </Modal>
                                            </View>
                                        );
                                    }

                                    // QR_VALIDATOR row
                                    const hasQrValidator = row.columns.some(col =>
                                        col.components.some(comp => comp.component === 'QR_VALIDATOR')
                                    );
                                    if (hasQrValidator) {
                                        const qrValidatorComp = row.columns.flatMap(c => c.components).find(c => c.component === 'QR_VALIDATOR');
                                        const expectedValue = qrValidatorComp?.defaultValue || qrValidatorComp?.text || '';
                                        const scannedValue = qrValidatorValues[row.webId] || '';
                                        const validationStatus = qrValidatorStatus[row.webId] || 'pending';
                                        const showValidatorScanner = showQrValidatorScanner[row.webId] || false;

                                        const getStatusColor = () => {
                                            switch (validationStatus) {
                                                case 'valid': return '#28B446';
                                                case 'invalid': return '#F44336';
                                                default: return '#D8ECFA';
                                            }
                                        };

                                        const getStatusText = () => {
                                            switch (validationStatus) {
                                                case 'valid': return '✓ Validated';
                                                case 'invalid': return '✗ Invalid';
                                                default: return 'Validate QR Code';
                                            }
                                        };

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.radioChoiceRow}
                                                    activeOpacity={0.8}
                                                    onPress={() => {
                                                        setShowQrValidatorScanner(prev => ({ ...prev, [row.webId]: true }));
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.radioOptionText,
                                                        {
                                                            backgroundColor: getStatusColor(),
                                                            paddingHorizontal: getResponsive(8),
                                                            paddingVertical: getResponsive(4),
                                                            borderRadius: getResponsive(6),
                                                            minWidth: getResponsive(120),
                                                            textAlign: 'center',
                                                            color: validationStatus === 'pending' ? '#021639' : '#fff',
                                                            fontWeight: validationStatus !== 'pending' ? 'bold' : 'normal'
                                                        }
                                                    ]}>
                                                        {getStatusText()}
                                                    </Text>
                                                </TouchableOpacity>
                                                
                                                {/* QR Validator Scanner Modal */}
                                                <Modal
                                                    visible={showValidatorScanner}
                                                    transparent={false}
                                                    animationType="slide"
                                                    onRequestClose={() => setShowQrValidatorScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                >
                                                    <View style={styles.qrScannerContainer}>
                                                        <View style={styles.qrScannerHeader}>
                                                            <TouchableOpacity
                                                                onPress={() => setShowQrValidatorScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                                style={styles.qrScannerClose}
                                                            >
                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.qrScannerTitle}>Validate QR Code</Text>
                                                        </View>
                                                        
                                                        <View style={styles.qrValidatorInfo}>
                                                            <Text style={styles.qrValidatorInfoText}>
                                                                Expected Value: <Text style={styles.qrValidatorExpectedValue}>{expectedValue}</Text>
                                                            </Text>
                                                        </View>
                                                        
                                                        <Camera
                                                            onReadCode={(event: any) => {
                                                                const scannedValue = event.nativeEvent.codeStringValue;
                                                                const isValid = scannedValue === expectedValue;
                                                                
                                                                setQrValidatorValues(prev => ({ ...prev, [row.webId]: scannedValue }));
                                                                setQrValidatorStatus(prev => ({ ...prev, [row.webId]: isValid ? 'valid' : 'invalid' }));
                                                                setShowQrValidatorScanner(prev => ({ ...prev, [row.webId]: false }));
                                                                
                                                                if (isValid) {
                                                                    showSuccessToast('QR Code Validated', `Value matches: ${scannedValue}`);
                                                                } else {
                                                                    showErrorToast('QR Code Invalid', `Expected: ${expectedValue}, Got: ${scannedValue}`);
                                                                }
                                                            }}
                                                            scanBarcode={true}
                                                            showFrame={true}
                                                            laserColor="red"
                                                            frameColor="white"
                                                            style={styles.qrScannerCamera}
                                                        />
                                                    </View>
                                                </Modal>
                                            </View>
                                        );
                                    }

                                    // Otherwise → render the normal label + radio buttons
                                    return (
                                        <View key={row.webId} style={[styles.radioRow]}>
                                            <Text style={styles.radioLabel}>
                                                {row.columns[0]?.components[0]?.text}
                                            </Text>

                                            <View style={styles.radioChoiceRow}>
                                                {row.columns[1]?.components.map((comp, cIdx) =>
                                                    comp.component === 'RADIO_BUTTON' ? (
                                                        <TouchableOpacity
                                                            key={comp.webId}
                                                            style={styles.radioOption}
                                                            activeOpacity={0.8}
                                                            onPress={() => {
                                                                setAnswers(prev => ({
                                                                    ...prev,
                                                                    [currentSection.webId]: {
                                                                        ...(prev[currentSection.webId] || {}),
                                                                        [row.webId]: comp.text,
                                                                    },
                                                                }));
                                                            }}
                                                        >
                                                            <Radio
                                                                selected={answers[currentSection.webId]?.[row.webId] === comp.text}
                                                            />
                                                            <Text
                                                                style={[
                                                                    styles.radioOptionText,
                                                                    answers[currentSection.webId]?.[row.webId] === comp.text && {
                                                                        color: '#0088E7',
                                                                        fontWeight: 'bold',
                                                                    },
                                                                ]}
                                                            >
                                                                {comp.text}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ) : null
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Next/Previous navigation */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                {filteredList.length === 1 ? (
                                    <TouchableOpacity
                                        style={[styles.submitBtn, { backgroundColor: '#28B446', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                                        activeOpacity={0.85}
                                        onPress={handleSubmit}
                                        disabled={syncMutation.status === 'pending'}
                                    >
                                        <Text style={styles.submitBtnText}>Submit</Text>
                                        {syncMutation.status === 'pending' ? (
                                            <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
                                        ) : null}
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        {currentSectionIdx === 0 && filteredList.length > 1 && (
                                            <TouchableOpacity
                                                style={[styles.submitBtn, { marginLeft: 'auto', marginRight: 0, backgroundColor: '#28B446', paddingHorizontal: 20, bottom: 20, right: 20 }]}
                                                activeOpacity={0.85}
                                                onPress={() => setCurrentSectionIdx(idx => Math.min(filteredList.length - 1, idx + 1))}
                                            >
                                                <Text style={styles.submitBtnText}>Next</Text>
                                            </TouchableOpacity>
                                        )}
                                        {currentSectionIdx === filteredList.length - 1 && filteredList.length > 1 && (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.submitBtn, { marginRight: 8, backgroundColor: '#28B446', paddingHorizontal: 20, bottom: 20, left: 20 }]}
                                                    activeOpacity={0.85}
                                                    onPress={() => setCurrentSectionIdx(idx => Math.max(0, idx - 1))}
                                                >
                                                    <Text style={styles.submitBtnText}>Previous</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.submitBtn, { backgroundColor: '#28B446', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                                                    activeOpacity={0.85}
                                                    onPress={handleSubmit}
                                                    disabled={syncMutation.status === 'pending'}
                                                >
                                                    <Text style={styles.submitBtnText}>Submit</Text>
                                                    {syncMutation.status === 'pending' ? (
                                                        <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
                                                    ) : null}
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        {currentSectionIdx > 0 && currentSectionIdx < filteredList.length - 1 && (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.submitBtn, { flex: 1, marginRight: 8, backgroundColor: '#28B446' }]}
                                                    activeOpacity={0.85}
                                                    onPress={() => setCurrentSectionIdx(idx => Math.max(0, idx - 1))}
                                                >
                                                    <Text style={styles.submitBtnText}>Previous</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.submitBtn, { flex: 1, marginLeft: 8, backgroundColor: '#28B446' }]}
                                                    activeOpacity={0.85}
                                                    onPress={() => setCurrentSectionIdx(idx => Math.min(filteredList.length - 1, idx + 1))}
                                                >
                                                    <Text style={styles.submitBtnText}>Next</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            <Modal visible={!!previewUri} transparent onRequestClose={() => setPreviewUri(null)}>
                <View style={styles.previewModal}>
                    <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUri(null)}>
                        <Text style={{ color: '#fff', fontSize: getResponsive(16), fontWeight: '700' }}>✕</Text>
                    </TouchableOpacity>
                    {previewUri ? (
                        <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
                    ) : null}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#0088E7',
        paddingTop: Platform.OS === 'ios' ? getResponsive(18) : getResponsive(55),
        paddingBottom: getResponsive(14),
        paddingHorizontal: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 0,
    },
    previewModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.98)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewClose: {
        position: 'absolute',
        top: getResponsive(40),
        right: getResponsive(20),
        zIndex: 2,
        padding: getResponsive(8),
    },
    textFieldBox: {
        backgroundColor: '#D8ECFA', // light blue like the image
        borderRadius: getResponsive(10),
        padding: getResponsive(8),
        minHeight: getResponsive(50),
        justifyContent: 'center',
    },
    textFieldInput: {
        color: '#021639',
        fontSize: getResponsive(12),
        fontWeight: '500',
        paddingVertical: getResponsive(4),
        paddingHorizontal: getResponsive(4),
        textAlignVertical: 'top',
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
        color: '#021639',
        fontWeight: '700',
        fontSize: getResponsive(16),
    },
    topCardSub: {
        color: '#02163980',
        fontWeight: '500',
        fontSize: getResponsive(12),
    },
    dot: {
        color: '#02163980',
        fontSize: getResponsive(18),
        marginHorizontal: 2,
        marginRight: getResponsive(8),
    },
    topCardDate: {
        fontSize: getResponsive(14),
        color: '#02163980',
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
        backgroundColor: '#F2F2F2',
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
        lineHeight: getResponsive(16),
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
        backgroundColor: '#F2F2F2',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(14),
        padding: getResponsive(16),
        flexDirection: 'row',
        // right: 200
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
        backgroundColor: '#F2F2F2',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(10),
        padding: getResponsive(16),
        flexDirection: 'row',
    },
    signatureBox: {
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
        top: 10,
        right: 12,
        backgroundColor: '#0088E7',
        padding: getResponsive(4),
        borderRadius: getResponsive(12),
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
    lookupModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: getResponsive(20),
    },
    lookupModalContent: {
        backgroundColor: '#fff',
        borderRadius: getResponsive(16),
        width: '100%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    lookupModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: getResponsive(20),
        paddingVertical: getResponsive(16),
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
    },
    lookupModalTitle: {
        fontSize: getResponsive(16),
        fontWeight: '600',
        color: '#19233C',
        flex: 1,
    },
    lookupModalClose: {
        padding: getResponsive(4),
    },
    lookupModalCloseText: {
        fontSize: getResponsive(20),
        color: '#19233C',
        fontWeight: '600',
    },
    lookupModalScroll: {
        maxHeight: getResponsive(400),
    },
    lookupOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: getResponsive(20),
        paddingVertical: getResponsive(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    lookupOptionSelected: {
        backgroundColor: '#E3F2FD',
    },
    lookupOptionText: {
        fontSize: getResponsive(14),
        color: '#19233C',
        fontWeight: '500',
        flex: 1,
    },
    lookupOptionTextSelected: {
        color: '#0088E7',
        fontWeight: '600',
    },
    lookupOptionCheck: {
        fontSize: getResponsive(18),
        color: '#0088E7',
        fontWeight: 'bold',
        marginLeft: getResponsive(12),
    },
    // ...existing code...
    // Add below existing styles:
    signatureModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: getResponsive(20),
    },
    signatureModalContent: {
        backgroundColor: '#fff',
        borderRadius: getResponsive(16),
        width: '100%',
        maxWidth: 520,
        paddingVertical: getResponsive(12),
        paddingHorizontal: getResponsive(12),
    },
    signatureModalTitle: {
        fontSize: getResponsive(16),
        fontWeight: '600',
        color: '#19233C',
        textAlign: 'center',
        marginBottom: getResponsive(8),
    },
    signatureModalCanvas: {
        height: getResponsive(220),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: getResponsive(10),
        overflow: 'hidden',
    },
    signatureModalBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: getResponsive(12),
    },
    signatureBtn: {
        flex: 1,
        paddingVertical: getResponsive(10),
        borderRadius: getResponsive(8),
        alignItems: 'center',
        marginHorizontal: getResponsive(6),
    },
    qrScannerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    qrScannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? getResponsive(50) : getResponsive(20),
        paddingHorizontal: getResponsive(20),
        paddingBottom: getResponsive(10),
        backgroundColor: '#000',
    },
    qrScannerClose: {
        padding: getResponsive(8),
    },
    qrScannerCloseText: {
        color: '#fff',
        fontSize: getResponsive(20),
        fontWeight: '600',
    },
    qrScannerTitle: {
        color: '#fff',
        fontSize: getResponsive(18),
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginRight: getResponsive(36), // To center the title (accounting for close button)
    },
    qrScannerCamera: {
        flex: 1,
    },
    qrValidatorInfo: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: getResponsive(20),
        paddingVertical: getResponsive(12),
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    qrValidatorInfoText: {
        color: '#fff',
        fontSize: getResponsive(14),
        textAlign: 'center',
    },
    qrValidatorExpectedValue: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
});


