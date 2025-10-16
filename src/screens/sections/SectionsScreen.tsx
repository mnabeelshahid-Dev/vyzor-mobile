import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDefinitionSections, fetchSectionRows, syncDocument } from '../../api/statistics';
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
    TextInput
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import CamaraIcon from '../../assets/svgs/camaraIcon.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import Signiture from '../../assets/svgs/segnitureImage.svg'
import { useRoute } from '@react-navigation/native';
import { showErrorToast, showSuccessToast } from '../../components';
import { ApiResponse } from '../../types';
import { ActionSheetIOS } from 'react-native';
import { Alert } from 'react-native';
import { Modal } from 'react-native';

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
        data
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
    } = data


    console.log("formSectionIds", formSectionIds);


    // Mutation for document sync
    const syncMutation = useMutation({
        mutationFn: async (body: any) => {
            return syncDocument(documentId, body);
        },
        onSuccess: () => {
            showSuccessToast('Document synced successfully!', 'Your document has been saved.');
        },
        onError: (error: any) => {
            console.log('[SectionsScreen] Document sync failed');
            console.log('Error:', error);
            if (error instanceof Error) {
                console.log('Error message:', error.message);
                showErrorToast('Failed to sync document.', error.message);
            } else {
                showErrorToast('Failed to sync document.', 'Please try again.');
            }
        }
    });

    const [rowImages, setRowImages] = useState<{ [rowId: string]: Array<{ uri: string, id: string }> }>({});
    const [textInputs, setTextInputs] = useState<{ [key: string]: string }>({});
    const [checkboxValues, setCheckboxValues] = useState<{ [key: string]: boolean }>({});
    const [switchValues, setSwitchValues] = useState<{ [key: string]: boolean }>({});
    const [textAreaInputs, setTextAreaInputs] = useState<{ [key: string]: string }>({});
    const [dateValues, setDateValues] = useState<{ [key: string]: string }>({});
    const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({});
    const [previewUri, setPreviewUri] = useState<string | null>(null);

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



    const filteredList = (() => {
        const rows = Array.isArray(sectionRowsData?.data) ? sectionRowsData.data : (sectionRowsData?.data || []);
        if (!rows || rows.length === 0) return [];
        return [{
            webId: formSectionIds.id1,
            name: data?.sectionName || formName || 'Section',
            formSectionRowModels: rows,
        }];
    })();

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

    const handleSubmit = () => {
        const sectionModels = filteredList.map(section => {
            return {
                startDate: formatDateTimeUTC(startDate || new Date()),
                endDate: formatDateTimeUTC(endDate || new Date()),
                key: section.key || section.webId || '',
                formConfigurationSectionId: section?.webId || 0,
                documentId: documentId,
                userId: assignUserId,
                data: (section.formSectionRowModels || []).flatMap(row => {
                    // RADIO_BUTTON answers
                    const answer = answers[section.webId]?.[row.webId];
                    const radioData = row.columns[1]?.components
                        .filter(comp => comp.component === 'RADIO_BUTTON')
                        .map(comp => ({
                            value: answer === comp.text ? comp.text : '', // Only set value if selected
                            controlId: comp.webId,
                            groupName: comp.groupName || null,
                            senserData: null,
                        }))?.filter(item => item.value) || [];

                    // CAMERA answers (images)
                    const cameraData = row.columns.some(col => col.components.some(comp => comp.component === 'CAMERA'))
                        ? [{
                            value: (rowImages[row.webId] || []).map(img => img.id),
                            controlId: row.columns[1]?.components.find(comp => comp.component === 'CAMERA')?.webId || '',
                            groupName: null,
                            senserData: null,
                        }]
                        : [];

                    // TEXT_FIELD answers
                    const textComp = row.columns.flatMap(col => col.components).find(c => c.component === 'TEXT_FIELD');
                    const textVal = textInputs[row.webId] || '';
                    const textData = textComp
                        ? [{
                            value: textVal,
                            controlId: textComp.webId,
                            groupName: textComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // CHECK_BOX answers
                    const checkboxComp = row.columns.flatMap(col => col.components).find(c => c.component === 'CHECK_BOX');
                    const checkboxVal = checkboxValues[row.webId] || false;
                    const checkboxData = checkboxComp
                        ? [{
                            value: checkboxVal ? 'true' : 'false',
                            controlId: checkboxComp.webId,
                            groupName: checkboxComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // SWITCH_BUTTON answers
                    const switchComp = row.columns.flatMap(col => col.components).find(c => c.component === 'SWITCH_BUTTON');
                    const switchVal = switchValues[row.webId] || false;
                    const switchData = switchComp
                        ? [{
                            value: switchVal ? 'true' : 'false',
                            controlId: switchComp.webId,
                            groupName: switchComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // TEXT_AREA answers
                    const textAreaComp = row.columns.flatMap(col => col.components).find(c => c.component === 'TEXT_AREA');
                    const textAreaVal = textAreaInputs[row.webId] || '';
                    const textAreaData = textAreaComp
                        ? [{
                            value: textAreaVal,
                            controlId: textAreaComp.webId,
                            groupName: textAreaComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    // DATE answers
                    const dateComp = row.columns.flatMap(col => col.components).find(c => c.component === 'DATE');
                    const dateVal = dateValues[row.webId] || '';
                    const dateData = dateComp
                        ? [{
                            value: dateVal,
                            controlId: dateComp.webId,
                            groupName: dateComp.groupName || null,
                            senserData: null,
                        }]
                        : [];

                    console.log("Radio Data:", radioData)
                    console.log("camera Data:", cameraData)
                    console.log("text Data:", textData)
                    console.log("Checkbox Data:", checkboxData)
                    console.log("Switch Data:", switchData)
                    console.log("TextArea Data:", textAreaData)
                    console.log("Date Data:", dateData)

                    return [...radioData, ...cameraData, ...textData, ...checkboxData, ...switchData, ...textAreaData, ...dateData];
                }),
            }
        });

        const body = {
            formDefinitionId,
            status: 'COMPLETED',
            userAccountId: assignUserId,
            clientId,
            siteId,
            flow: 1,
            deleted: false,
            completedDate: formatToUTC(new Date()),
            sectionModels,
        };

        // Log the full request body before sending
        console.log('[SectionsScreen] Submitting body:', JSON.stringify(body, null, 2));

        syncMutation.mutate(body, {
            onSuccess: (data: any, variables, context) => {
                // Log the full response from backend
                () => showSuccessToast('Document synced successfully!', 'Your document has been saved.');
                navigation.goBack();
                console.log('[SectionsScreen] Backend full response:', data);
                if (data?.status) {
                    console.log(`[SectionsScreen] Backend responded with status: ${data.status}`);
                } else if (data?.response?.status) {
                    console.log(`[SectionsScreen] Backend responded with status: ${data.response.status}`);
                }
            },
            onError: (error: any) => {
                // Log the full error object
                console.log('[SectionsScreen] Backend error (full):', error);
                if (error?.response) {
                    // If axios-like error, log response data
                    console.log('[SectionsScreen] Backend error response data:', error.response.data);
                    console.log('[SectionsScreen] Backend error response status:', error.response.status);
                    console.log('[SectionsScreen] Backend error response headers:', error.response.headers);
                }
                if (error?.response?.status) {
                    console.log(`[SectionsScreen] Backend error status: ${error.response.status}`);
                } else if (error?.status) {
                    console.log(`[SectionsScreen] Backend error status: ${error.status}`);
                }
            }
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
        backgroundColor: '#fcf7f9ff',
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


