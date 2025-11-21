import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSectionRows, syncDocument, fetchLookupOptions, fetchFileUrl, fetchMediaUrl, normalizeMediaUrl } from '../../api/statistics';
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
    ActionSheetIOS,
    Linking

} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera } from 'react-native-camera-kit';
import { pick, types } from '@react-native-documents/picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CamaraIcon from '../../assets/svgs/camaraIcon.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import RefreshSignatureIcon from '../../assets/svgs/RefreshSignature.svg';
import QRCodeScannerIcon from '../../assets/svgs/qrcodescanner.svg';
import QRCodeValidatorIcon from '../../assets/svgs/qrcodevalidator.svg';
import BarCodeScannerIcon from '../../assets/svgs/barcodescannernew.svg';
import BarCodeValidatorIcon from '../../assets/svgs/barcodesvalidator.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import { useRoute } from '@react-navigation/native';
import { showErrorToast, showSuccessToast } from '../../components';
import { apiService } from '../../services/api';
import { ensureCameraAndMediaPermissions } from '../../utils/takeImagePermission';
import { generateUUID } from '../../utils/generateUUID';

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

const AttachmentIcon = () => (
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
        <Svg
            width={getResponsive(26)}
            height={getResponsive(26)}
            viewBox="0 0 24 24"
            fill="none"
        >
            <Path
                d="M8.5 10.75V7a3.5 3.5 0 1 1 7 0v6a4.5 4.5 0 1 1-9 0V8.75"
                stroke="white"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M12 7.25v5.25a1.75 1.75 0 1 1-3.5 0V9.5"
                stroke="white"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
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

const CustomSwitch = ({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) => (
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

const Timer = ({
    value,
    isRunning,
    onStart,
    onPause,
    onReset
}: {
    value: string;
    isRunning: boolean;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
}) => (
    <View style={{
        backgroundColor: '#fff',
        borderRadius: getResponsive(12),
        padding: getResponsive(4),
        marginLeft: getResponsive(4),
        minWidth: getResponsive(120),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }}>
        {/* Timer Display */}
        <View style={{
            alignItems: 'center',
            marginBottom: getResponsive(16),
        }}>
            <Text style={{
                fontSize: getResponsive(12),
                color: '#19233C',
                fontFamily: 'monospace',
                letterSpacing: 1,
            }}>
                {value}
            </Text>
        </View>

        {/* Control Buttons */}
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: getResponsive(12),
        }}>
            {/* Start/Resume Button */}
            <TouchableOpacity
                style={{
                    width: getResponsive(32),
                    height: getResponsive(32),
                    borderRadius: getResponsive(24),
                    backgroundColor: '#28B446',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                }}
                onPress={onStart}
                activeOpacity={0.8}
            >
                <Text style={{
                    color: '#fff',
                    fontSize: getResponsive(18),
                    fontWeight: 'bold',
                }}>
                    ▶
                </Text>
            </TouchableOpacity>

            {/* Pause Button */}
            <TouchableOpacity
                style={{
                    width: getResponsive(32),
                    height: getResponsive(32),
                    borderRadius: getResponsive(24),
                    backgroundColor: '#FF6B6B',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                }}
                onPress={onPause}
                activeOpacity={0.8}
            >
                <Text style={{
                    color: '#fff',
                    backgroundColor: '#FF6B6B',
                    fontSize: getResponsive(16),
                    fontWeight: 'bold',
                }}>
                    ⏸
                </Text>
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity
                style={{
                    width: getResponsive(32),
                    height: getResponsive(32),
                    borderRadius: getResponsive(24),
                    backgroundColor: '#4A90E2',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                }}
                onPress={onReset}
                activeOpacity={0.8}
            >
                <Text style={{
                    color: '#fff',
                    fontSize: getResponsive(18),
                    fontWeight: 'bold',
                }}>
                    ⟲
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

export default function SectionsScreen({ navigation }: { navigation: any }) {
    // Get formDefinitionId, status, and sourceScreen from route params
    const route = useRoute();
    const queryClient = useQueryClient();
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
    function getImageIdFromRow(row: any) {
        const imageComponent = row.columns?.flatMap((c: any) => c.components || [])?.find((c: any) => c.component === 'IMAGE');
        const getAttr = (k: string) => imageComponent?.attrs?.find((a: any) => a.key === k)?.value;
        return (
            getAttr('imageId') ??
            getAttr('fileId') ??
            getAttr('id') ??
            imageComponent?.defaultValue ??
            imageComponent?.text ??
            null
        );
    }

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
    const [barcodeValues, setBarcodeValues] = useState<{ [key: string]: string }>({});
    const [showBarcodeScanner, setShowBarcodeScanner] = useState<{ [key: string]: boolean }>({});
    const [barcodeValidatorValues, setBarcodeValidatorValues] = useState<{ [key: string]: string }>({});
    const [barcodeValidatorStatus, setBarcodeValidatorStatus] = useState<{ [key: string]: 'pending' | 'valid' | 'invalid' }>({});
    const [showBarcodeValidatorScanner, setShowBarcodeValidatorScanner] = useState<{ [key: string]: boolean }>({});
    const [attachmentsByRow, setAttachmentsByRow] = useState<{ [rowId: string]: Array<{ id: string; name: string; uri?: string; type?: string; size?: number }> }>({});
    const [isUploadingAttachment, setIsUploadingAttachment] = useState<{ [rowId: string]: boolean }>({});
    const [showAttachmentModal, setShowAttachmentModal] = useState<{ [rowId: string]: boolean }>({});
    const [timerValues, setTimerValues] = useState<{ [key: string]: string }>({});
    const [timerRunning, setTimerRunning] = useState<{ [key: string]: boolean }>({});
    const [timerStartTime, setTimerStartTime] = useState<{ [key: string]: number }>({});
    const [timerElapsedTime, setTimerElapsedTime] = useState<{ [key: string]: number }>({});
    const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});
    const [showLookupModal, setShowLookupModal] = useState<{ [rowId: string]: boolean }>({});
    const [answers, setAnswers] = useState<{ [sectionId: string]: { [rowId: string]: string } }>({});
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [imageUrlsByRow, setImageUrlsByRow] = useState<{ [rowId: string]: string }>({});
    const [imageUrl, setImageUrl] = useState<string | null>(null); // keeps your preview state
    // replace single ref with a map of refs and helpers
    const signatureRefs = useRef<{ [rowId: string]: any }>({});
    const signatureWaiters = useRef<{ [rowId: string]: (res: { pathName: string; encoded: string }) => void }>({});
    const signatureSaveTimers = useRef<{ [rowId: string]: any }>({});
    const signatureRowIdsRef = useRef<Set<string>>(new Set());
    const [loaded, setLoaded] = useState(false);

    const getImageUrl = (row: any) => imageUrlsByRow[row.webId] || null;



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

    function safeReadSignature(rowId: string) {
        return new Promise<void>((resolve) => {
            const ref = signatureRefs.current[rowId];
            if (!ref || typeof ref.readSignature !== 'function') return resolve();

            signatureWaiters.current[rowId] = () => resolve();

            let tries = 0;
            const tryRead = () => {
                try {
                    ref.readSignature();
                } catch (e: any) {
                    if (tries++ < 2) {
                        setTimeout(tryRead, 120);
                    } else {
                        // Don’t spam console: just resolve and let user re-try if needed
                        resolve();
                    }
                }
            };

            setTimeout(tryRead, 60);
        });
    }



    async function ensureAllSignaturesSaved(): Promise<boolean> {
        // Validate only currently visible section’s signature rows
        try {
            const missing: string[] = [];
            const rows = (filteredList[0]?.formSectionRowModels || []) as any[];
            rows.forEach((row) => {
                const hasSignature = row.columns?.some((col: any) =>
                    col.components?.some((c: any) => c.component === 'SIGNATURE')
                );
                if (hasSignature && !signatureValues[row.webId]?.encoded) {
                    missing.push(row.columns?.[0]?.components?.[0]?.text || 'Signature');
                }
            });

            if (missing.length) {
                // showErrorToast('Signature required', `Please provide: ${missing[0]}`);
                return false;
            }
            return true;
        } catch {
            return true;
        }
    }

    const handleAddImages = async (rowId: string): Promise<void> => {
        const remaining = Math.max(1, 5 - (rowImages[rowId]?.length || 0));

        // small retry helper for transient network failures (declared as a function to avoid TSX generic parsing issues)
        async function retryAsync<T>(fn: () => Promise<T>, attempts = 3, delayMs = 1000): Promise<T> {
            let lastErr: any;
            for (let i = 0; i < attempts; i++) {
                try {
                    return await fn();
                } catch (e) {
                    lastErr = e;
                    if (i < attempts - 1) await new Promise(res => setTimeout(res, delayMs));
                }
            }
            throw lastErr;
        }

        const handleAssetsAndUpload = async (assets?: any[]): Promise<void> => {
            if (!assets?.length) return;

            // Filter out invalid / empty uris up-front (prevents Image.getSize empty-uri error)
            const validAssets = (assets || []).filter(a => !!a?.uri).slice(0, remaining);
            if (validAssets.length === 0) {
                showErrorToast('No valid image', 'Selected image had no URI');
                return;
            }

            // Sequential loop (less likely to abort on flaky mobile networks)
            for (const a of validAssets) {
                const assetForUpload = {
                    fileName: a.fileName || a.name || `photo_${Date.now()}`,
                    uri: a.uri,
                    type: a.type || a.mimeType || 'image/jpeg',
                    size: a.fileSize ?? a.size,
                };

                // optimistic preview: add local image immediately with a localId so we can replace it later
                const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                setRowImages(prev => ({
                    ...prev,
                    [rowId]: [...(prev[rowId] || []), { uri: assetForUpload.uri, id: localId }].slice(0, 5),
                }));

                try {
                    // call uploadAttachment wrapped in retry to mitigate transient network errors
                    const uploaded = await retryAsync(
                        () => uploadAttachment(rowId, assetForUpload, { onProgress: (p) => { /* optional */ }, showToast: false }),
                        2,
                        1500
                    );

                    if (uploaded) {
                        // replace local preview id with server id
                        setRowImages(prev => ({
                            ...prev,
                            [rowId]: (prev[rowId] || []).map(item => item.id === localId ? ({ uri: uploaded.uri, id: uploaded.id }) : item)
                        }));
                    } else {
                        // uploadAttachment returned null — keep local preview entry (and allow user to retry)
                        showErrorToast('Upload failed', 'Server did not return file info');
                    }
                } catch (err: any) {
                    // after retries, still failed
                    showErrorToast('Upload failed', err?.message || 'Network error');
                    // Keep the local image so user can see what failed and retry if needed
                }
            }
        };

        // camera / library selection handlers
        const fromCamera = async (): Promise<void> => {
            const ok = await ensureCameraAndMediaPermissions();
            if (!ok) { showErrorToast('Camera blocked', 'Grant Camera and Photos permissions.'); return; }
            try {
                const res = await launchCamera({ mediaType: 'photo', saveToPhotos: true, cameraType: 'back', quality: 0.9 });
                if (res.didCancel) return;
                if (res.errorCode) { showErrorToast('Camera error', res.errorMessage || res.errorCode); return; }
                if (res.assets?.length) await handleAssetsAndUpload(res.assets);
            } catch (e: any) {
                showErrorToast('Camera error', e?.message || 'Failed to open camera');
            }
        };

        const fromLibrary = async (): Promise<void> => {
            const ok = await ensureCameraAndMediaPermissions();
            if (!ok) { showErrorToast('Photos blocked', 'Grant Photos permission.'); return; }
            try {
                const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: remaining, quality: 0.9 });
                if (res.didCancel) return;
                if (res.errorCode) { showErrorToast('Library error', res.errorMessage || res.errorCode); return; }
                if (res.assets?.length) await handleAssetsAndUpload(res.assets);
            } catch (e: any) {
                showErrorToast('Library error', e?.message || 'Failed to open library');
            }
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
                (i: number) => { if (i === 1) fromCamera(); if (i === 2) fromLibrary(); }
            );
        } else {
            Alert.alert('Add Photo', undefined, [
                { text: 'Take Photo', onPress: fromCamera },
                { text: 'Choose from Library', onPress: fromLibrary },
                { text: 'Cancel', style: 'cancel' }
            ], { cancelable: true });
        }
    };


    const handleRemoveImage = (rowId: string, imgId: string) => {
        setRowImages(prev => ({
            ...prev,
            [rowId]: (prev[rowId] || []).filter(img => img.id !== imgId)
        }));
    };

    const handleRemoveAttachment = (rowId: string, fileId: string) => {
        setAttachmentsByRow(prev => ({
            ...prev,
            [rowId]: (prev[rowId] || []).filter(f => f.id !== fileId)
        }));
    };

    const uploadAttachment = async (rowId: string, asset: any) => {
        try {
            const fileName =
                asset.fileName ||
                asset.name ||
                (typeof asset.uri === 'string' ? asset.uri.split('/').pop() : null) ||
                'attachment';

            const fileUri = asset.uri;
            const type = asset.type || asset.mimeType || 'application/octet-stream';
            const fileSize = asset.size;

            if (!fileUri) {
                showErrorToast('Attachment failed', 'No file URI returned');
                return;
            }

            const formData = new FormData();
            // @ts-ignore RN FormData file
            formData.append('content', { uri: fileUri, name: fileName, type });

            const ownerId =
                typeof documentId === 'string' ? Number(documentId) :
                    typeof documentId === 'number' ? documentId : 0;

            const meta = {
                id: generateUUID() , //bring me here
                ownerWebId: ownerId,
                name: fileName,
            };

            const fullUrl = `/api/dms/file?json=${encodeURIComponent(JSON.stringify(meta))}`;

            console.log('➡️ Upload URL (raw json query):', fullUrl);
            console.log('➡️ Meta JSON (raw):', meta);
            const res = await apiService.postFileData<any>(fullUrl, formData);

            if (!res?.success || !res?.data) {
                throw new Error(res?.message || 'Upload failed');
            }

            // Use the correct ID field from the API response
            const fileId = res.data.id; // This is the correct field
            const returnedName = res.data.name || fileName;

            const uploadedFile = {
                id: fileId, // This will now be the UUID from the server
                name: returnedName,
                uri: fileUri,
                type,
                size: fileSize,
            };

            setAttachmentsByRow(prev => ({
                ...prev,
                [rowId]: [...(prev[rowId] || []), uploadedFile],
            }));

            showSuccessToast('Attachment uploaded', returnedName);
            return uploadedFile;

        } catch (e: any) {
            console.log('❌ [UPLOAD ERROR]', e?.message || e);
            showErrorToast('Attachment failed', e?.message || 'Upload error');
        }
    };


    const checkAndRequestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                // For Android 13+ (API 33+), we need READ_MEDIA_IMAGES permission
                // For older versions, we need READ_EXTERNAL_STORAGE
                const androidVersion = Platform.Version;
                console.log('Android version:', androidVersion);

                let permission;
                if (androidVersion >= 33) {
                    permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
                } else {
                    permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
                }

                console.log('Requesting permission:', permission);
                const result = await request(permission);
                console.log('Permission result:', result);

                if (result === RESULTS.GRANTED) {
                    return true;
                } else if (result === RESULTS.DENIED) {
                    // Show a more helpful message
                    showErrorToast('Permission required', 'Storage permission is required to select files. Please grant permission when prompted.');
                    return false;
                } else if (result === RESULTS.NEVER_ASK_AGAIN) {
                    showErrorToast('Permission denied', 'Please enable storage permission in app settings');
                    return false;
                } else {
                    showErrorToast('Permission error', 'Unable to get storage permission');
                    return false;
                }

            } catch (error) {
                console.log('Permission error:', error);
                showErrorToast('Permission error', 'Unable to request storage permission');
                return false;
            }
        }
        return true; // iOS doesn't need explicit permission for document picker
    };

    const handleAddAttachments = async (rowId: string) => {
        const remaining = Math.max(1, 5 - (attachmentsByRow[rowId]?.length || 0));

        const fromLibrary = async () => {
            const res = await launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: remaining,
            });


            if (res.assets?.length) {
                for (const asset of res.assets) {
                    await uploadAttachment(rowId, asset);
                }
            }
        };

        const fromFileManager = async () => {
            try {
                console.log('Opening document picker...');
                const res = await pick({
                    type: [types.allFiles],
                    allowMultiSelection: true,
                });
                console.log('Document picker result:', res);

                if (res?.length) {
                    for (const doc of res) {
                        console.log('Uploading document:', doc);
                        await uploadAttachment(rowId, doc);
                    }
                }
            } catch (err) {
                console.log('Document picker error:', err);
                if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
                    // User cancelled the picker
                    console.log('User cancelled document picker');
                } else if (err?.message?.includes('permission') || err?.message?.includes('Permission')) {
                    // If it's a permission error, try requesting permissions first
                    console.log('Permission error detected, requesting permissions...');
                    const hasPermission = await checkAndRequestPermissions();
                    if (hasPermission) {
                        // Retry the document picker
                        try {
                            const retryRes = await pick({
                                type: [types.allFiles],
                                allowMultiSelection: true,
                            });
                            if (retryRes?.length) {
                                for (const doc of retryRes) {
                                    await uploadAttachment(rowId, doc);
                                }
                            }
                        } catch (retryErr) {
                            showErrorToast('File selection failed', `Unable to select files: ${retryErr?.message || 'Unknown error'}`);
                        }
                    }
                } else {
                    showErrorToast('File selection failed', `Unable to select files: ${err?.message || 'Unknown error'}`);
                }
            }
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Choose from Library', 'Choose from Files'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) fromLibrary();
                    if (buttonIndex === 2) fromFileManager();
                }
            );
        } else {
            Alert.alert(
                'Add Attachment',
                undefined,
                [
                    { text: 'Choose from Library', onPress: fromLibrary },
                    { text: 'Choose from Files', onPress: fromFileManager },
                    { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
            );
        }
    };


    // Fetch definition sections with sequence
    const {
        data: definitionSectionsData,
    } = useQuery({
        queryKey: ['definitionSections', formDefinitionId],
        queryFn: async () => {
            if (!formDefinitionId) return null;
            const response = await apiService.get<any>(
                `/api/forms/definitionSections?formDefinitionId=${formDefinitionId}&status=ACTIVE`
            );
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        },
        enabled: !!formDefinitionId,
    });

    // for multi sections 
    // Create a mapping from formSectionId to sequence
    const sectionSequenceMap = React.useMemo(() => {
        if (!definitionSectionsData?.content) return {};
        const map: { [key: number]: number } = {};
        definitionSectionsData.content.forEach((section: any) => {
            if (section.formSectionId && typeof section.sequence === 'number') {
                map[section.formSectionId] = section.sequence;
            }
        });
        return map;
    }, [definitionSectionsData]);

    const sectionKeys = React.useMemo(() => {
        const keys = Object.keys(formSectionIds || {});
        // Sort by sequence if available, otherwise fallback to numeric key sorting
        return keys.sort((a, b) => {
            const sectionIdA = formSectionIds?.[a];
            const sectionIdB = formSectionIds?.[b];
            const sequenceA = sectionSequenceMap[sectionIdA] ?? Number(a.replace('id', ''));
            const sequenceB = sectionSequenceMap[sectionIdB] ?? Number(b.replace('id', ''));
            return sequenceA - sequenceB;
        });
    }, [formSectionIds, sectionSequenceMap]);

    const sectionIds = React.useMemo(
        () => sectionKeys.map(k => formSectionIds?.[k]).filter(Boolean),
        [sectionKeys, formSectionIds]
    );
    const configSectionIds = React.useMemo(
        () => sectionKeys.map(k => formConfigurationSectionIds?.[k]).filter(Boolean),
        [sectionKeys, formConfigurationSectionIds]
    );
    const totalSections = sectionIds.length;
    const currentSectionId = sectionIds[currentSectionIdx] ?? null;
    const currentFormConfigurationSectionId =
        configSectionIds[currentSectionIdx] ??
        formConfigurationSectionIds?.[`id${currentSectionIdx + 1}`] ??
        0;

    const handleNext = () => {
        if (currentSectionIdx < totalSections - 1) {
            const nextIdx = currentSectionIdx + 1;
            setCurrentSectionIdx(nextIdx);
        }
    };

    const handlePrev = () => {
        if (currentSectionIdx > 0) {
            setCurrentSectionIdx(currentSectionIdx - 1);
        }
    };

    // Keep index in range if ids change
    React.useEffect(() => {
        if (currentSectionIdx > Math.max(0, totalSections - 1)) {
            setCurrentSectionIdx(0);
        }
    }, [totalSections]);

    const {
        data: sectionRowsData,
        isLoading: isSectionRowsLoading,
        isError: isSectionRowsError,
        refetch: refetchSectionRows,
    } = useQuery({
        queryKey: ['sectionRows', currentSectionId],
        queryFn: () => (currentSectionId ? fetchSectionRows(currentSectionId) : Promise.resolve([])),
        enabled: !!currentSectionId,
        // automatically refetch every 2 minutes
        refetchInterval: 2 * 60 * 1000,
        refetchIntervalInBackground: true,
    });


    React.useEffect(() => {
        if (currentSectionId) {
            refetchSectionRows();
        }
    }, [currentSectionId, refetchSectionRows]);

    // Prefetch the next section to make Next feel instant
    React.useEffect(() => {
        const nextId = sectionIds[currentSectionIdx + 1];
        if (nextId) {
            queryClient.prefetchQuery({
                queryKey: ['sectionRows', nextId],
                queryFn: () => fetchSectionRows(nextId),
            });
        }
    }, [currentSectionIdx, sectionIds, queryClient]);

    // Fetch lookup options for all LOOKUP controls
    React.useEffect(() => {
        if (!sectionRowsData?.data) return;

        const rows = Array.isArray(sectionRowsData.data) ? sectionRowsData.data : [sectionRowsData.data];

        // Filter out deleted rows and components
        rows.filter((row: any) => !row.deleted).forEach((row: any) => {
            row.columns?.forEach((col: any) => {
                col.components?.filter((comp: any) => !comp.deleted).forEach((comp: any) => {
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

    // Timer effect to update display
    React.useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            Object.keys(timerRunning).forEach(rowId => {
                if (timerRunning[rowId] && timerStartTime[rowId]) {
                    // Calculate total elapsed time including previous paused time
                    const currentSessionTime = now - timerStartTime[rowId];
                    const totalElapsed = (timerElapsedTime[rowId] || 0) + currentSessionTime;

                    const totalSeconds = Math.floor(totalElapsed / 1000);
                    const milliseconds = Math.floor((totalElapsed % 1000) / 10); // Get centiseconds
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;

                    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}0000`;

                    setTimerValues(prev => ({
                        ...prev,
                        [rowId]: formattedTime
                    }));
                }
            });
        }, 10); // Update every 10ms for smooth display

        return () => clearInterval(interval);
    }, [timerRunning, timerStartTime, timerElapsedTime]);

    const filteredList = (() => {
        const rows = Array.isArray(sectionRowsData?.data) ? sectionRowsData.data : (sectionRowsData?.data || []);
        if (!rows || rows.length === 0 || !currentSectionId) return [];
        
        // Filter out rows with deleted: true
        const filteredRows = rows.filter((row: any) => !row.deleted);
        
        // Filter out components with deleted: true within each row
        const rowsWithFilteredComponents = filteredRows.map((row: any) => {
            if (!row.columns) return row;
            return {
                ...row,
                columns: row.columns.map((col: any) => {
                    if (!col.components) return col;
                    return {
                        ...col,
                        components: col.components.filter((comp: any) => !comp.deleted)
                    };
                }).filter((col: any) => col.components && col.components.length > 0)
            };
        }).filter((row: any) => row.columns && row.columns.length > 0);
        
        if (rowsWithFilteredComponents.length === 0) return [];
        
        // Extract section name from the first row (all rows in a section have the same sectionName)
        const sectionName = rowsWithFilteredComponents[0]?.sectionName || data?.sectionName || formName || 'Section';
        return [
            {
                webId: currentSectionId,
                name: sectionName,
                formSectionRowModels: rowsWithFilteredComponents,
            },
        ];
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

    // Helper: get rows for a section from cache or fetch
    const getRowsForSection = async (sectionId: number | string) => {
        const key = ['sectionRows', sectionId] as const;
        const cached: any = queryClient.getQueryData(key);
        let rows = Array.isArray(cached?.data) ? cached.data : (cached?.data || null);
        if (!rows) {
            const resp = await fetchSectionRows(sectionId);
            rows = Array.isArray(resp?.data) ? resp.data : (resp?.data || []);
            queryClient.setQueryData(key, resp);
        }
        return rows as any[];
    };



    console.log(generateUUID(), "Generating UUID");


    const handleSubmit = async () => {
        await ensureAllSignaturesSaved();
        // Build all sectionModels (id1, id2, ...)
        const sectionModels = await Promise.all(
            sectionIds.map(async (sectionId, idx) => {
                const formConfigId =
                    configSectionIds[idx] ??
                    formConfigurationSectionIds?.[`id${idx + 1}`] ??
                    0;

                const rows = await getRowsForSection(sectionId);
                console.log("rows", rows)

                if (!rows || rows.length === 0) return null;

                // Filter out deleted rows and components
                const filteredRows = rows.filter((row: any) => !row.deleted).map((row: any) => {
                    if (!row.columns) return row;
                    return {
                        ...row,
                        columns: row.columns.map((col: any) => {
                            if (!col.components) return col;
                            return {
                                ...col,
                                components: col.components.filter((comp: any) => !comp.deleted)
                            };
                        }).filter((col: any) => col.components && col.components.length > 0)
                    };
                }).filter((row: any) => row.columns && row.columns.length > 0);

                if (!filteredRows || filteredRows.length === 0) return null;

                const dataItems = filteredRows
                    // .filter((row: any) => {
                    //     // Skip rows where all columns have null components
                    //     if (!row.columns || row.columns.length === 0) return false;
                    //     return row.columns.some((col: any) => col.components != null);
                    // })
                    .flatMap((row: any) => {
                    var keyuuid = row?.key;
                    const comps = row.columns?.flatMap((col: any) => col.components || []) || [];

                    // RADIO_BUTTON (only include the selected one) - handle both single column and multi-column
                    const radioButtons = comps.filter((c: any) => c.component === 'RADIO_BUTTON');
                    const radioData = radioButtons.length > 0 ? (() => {
                        // Try to get answer from row.webId first, then from first radio button's webId (multi-column case)
                        const firstRadioId = radioButtons[0]?.webId;
                        const answer = answers[sectionId]?.[row.webId] || answers[sectionId]?.[firstRadioId];
                        
                        return radioButtons
                            .map((c: any) => {
                                return {
                                    value: answer === c.text ? c.text : '',
                                    controlId: c.controlId || '',
                                    groupName: c.name || null,
                                    senserData: null,
                                }
                            })
                            .filter((i: any) => i.value);
                    })() : [];

                    // CAMERA - handle both single column and multi-column cases
                    const cameraComps = comps.filter((c: any) => c.component === 'CAMERA');
                    const cameraData = cameraComps.map((cameraComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const images = rowImages[cameraComp.webId] || rowImages[row.webId] || [];
                        return {
                            value: images.map((img) => img.id),
                            controlId: cameraComp.controlId || '',
                            groupName: cameraComp.name || null,
                            senserData: null,
                        };
                    });

                    // ATTACHEMENTS - handle both single column and multi-column cases
                    const attachComps = comps.filter((c: any) => c.component === 'ATTACHEMENTS');
                    const attachmentsData = attachComps.map((attachComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const files = attachmentsByRow[attachComp.webId] || attachmentsByRow[row.webId] || [];
                        return {
                            value: files.map((f) => f.id),
                            controlId: attachComp.controlId || '',
                            groupName: attachComp.name || null,
                            senserData: null,
                        };
                    });

                    // TEXT_FIELD - handle both single column and multi-column cases
                    const textFieldComps = comps.filter((c: any) => c.component === 'TEXT_FIELD');
                    const textData = textFieldComps.map((textComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const textVal = textInputs[textComp.webId] || textInputs[row.webId] || '';
                        return {
                            value: textVal,
                            controlId: textComp.controlId || '',
                            groupName: textComp.name || null,
                            senserData: null,
                        };
                    });

                    // CHECK_BOX - handle both single column and multi-column cases
                    const checkboxComps = comps.filter((c: any) => c.component === 'CHECK_BOX');
                    const checkboxData = checkboxComps.map((checkboxComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const checkboxVal = checkboxValues[checkboxComp.webId] ?? checkboxValues[row.webId] ?? false;
                        return {
                            value: checkboxVal,
                            controlId: checkboxComp.controlId || '',
                            groupName: checkboxComp.name || null,
                            senserData: null,
                        };
                    });

                    // SWITCH_BUTTON - handle both single column and multi-column cases
                    const switchComps = comps.filter((c: any) => c.component === 'SWITCH_BUTTON');
                    const switchData = switchComps.map((switchComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const switchVal = switchValues[switchComp.webId] ?? switchValues[row.webId] ?? false;
                        return {
                            value: switchVal,
                            controlId: switchComp.controlId || '',
                            groupName: switchComp.name || null,
                            senserData: null,
                        };
                    });

                    // TEXT_AREA - handle both single column and multi-column cases
                    const textAreaComps = comps.filter((c: any) => c.component === 'TEXT_AREA');
                    const textAreaData = textAreaComps.map((textAreaComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const textAreaVal = textAreaInputs[textAreaComp.webId] || textAreaInputs[row.webId] || '';
                        return {
                            value: textAreaVal,
                            controlId: textAreaComp.controlId || '',
                            groupName: textAreaComp.name || null,
                            senserData: null,
                        };
                    });

                    // DATE - handle both single column and multi-column cases
                    const dateComps = comps.filter((c: any) => c.component === 'DATE');
                    const dateData = dateComps.map((dateComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const dateVal = dateValues[dateComp.webId] || dateValues[row.webId] || '';
                        return {
                            value: dateVal,
                            controlId: dateComp.controlId || '',
                            groupName: dateComp.name || null,
                            senserData: null,
                        };
                    });

                    // RATING - handle both single column and multi-column cases
                    const ratingComps = comps.filter((c: any) => c.component === 'RATING');
                    const ratingData = ratingComps.map((ratingComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const ratingVal = ratingValues[ratingComp.webId] ?? ratingValues[row.webId] ?? 0;
                        return {
                            value: Number(ratingVal),
                            controlId: ratingComp.controlId || '',
                            groupName: ratingComp.name || null,
                            senserData: null,
                        };
                    });

                    // LOOKUP - handle both single column and multi-column cases
                    const lookupComps = comps.filter((c: any) => c.component === 'LOOKUP');
                    const lookupData = lookupComps.map((lookupComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const lookupVal = lookupValues[lookupComp.webId] || lookupValues[row.webId] || '';
                        return {
                            value: lookupVal,
                            controlId: lookupComp.controlId || '',
                            groupName: lookupComp.name || null,
                            senserData: null,
                        };
                    });

                    // SIGNATURE - handle both single column and multi-column cases
                    const signatureComps = comps.filter((c: any) => c.component === 'SIGNATURE');
                    const signatureData = signatureComps.map((signatureComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const signatureVal = signatureValues[signatureComp.webId]?.encoded || signatureValues[row.webId]?.encoded || '';
                        return {
                            value: signatureVal,
                            controlId: signatureComp.controlId || '',
                            groupName: signatureComp.name || null,
                            senserData: null,
                        };
                    });

                    // QR_CODE - handle both single column and multi-column cases
                    const qrCodeComps = comps.filter((c: any) => c.component === 'QR_CODE');
                    const qrCodeData = qrCodeComps.map((qrCodeComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const qrCodeVal = qrCodeValues[qrCodeComp.webId] || qrCodeValues[row.webId] || '';
                        return {
                            value: qrCodeVal,
                            controlId: qrCodeComp.controlId || '',
                            groupName: qrCodeComp.name || null,
                            senserData: null,
                        };
                    });

                    // QR_VALIDATOR - handle both single column and multi-column cases
                    const qrValidatorComps = comps.filter((c: any) => c.component === 'QR_VALIDATOR');
                    const qrValidatorData = qrValidatorComps.map((qrValidatorComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const qrValidatorVal = qrValidatorValues[qrValidatorComp.webId] || qrValidatorValues[row.webId] || '';
                        return {
                            value: qrValidatorVal,
                            controlId: qrValidatorComp.controlId || '',
                            groupName: qrValidatorComp.name || null,
                            senserData: null,
                        };
                    });

                    // BAR_CODE - handle both single column and multi-column cases
                    const barcodeComps = comps.filter((c: any) => c.component === 'BAR_CODE');
                    const barcodeData = barcodeComps.map((barcodeComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const barcodeVal = barcodeValues[barcodeComp.webId] || barcodeValues[row.webId] || '';
                        return {
                            value: barcodeVal,
                            controlId: barcodeComp.controlId || '',
                            groupName: barcodeComp.name || null,
                            senserData: null,
                        };
                    });

                    // BAR_VALIDATOR - handle both single column and multi-column cases
                    const barcodeValidatorComps = comps.filter((c: any) => c.component === 'BAR_VALIDATOR');
                    const barcodeValidatorData = barcodeValidatorComps.map((barcodeValidatorComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const barcodeValidatorVal = barcodeValidatorValues[barcodeValidatorComp.webId] || barcodeValidatorValues[row.webId] || '';
                        return {
                            value: barcodeValidatorVal,
                            controlId: barcodeValidatorComp.controlId || '',
                            groupName: barcodeValidatorComp.name || null,
                            senserData: null,
                        };
                    });

                    // TIMER - handle both single column and multi-column cases
                    const timerComps = comps.filter((c: any) => c.component === 'TIMER');
                    const timerData = timerComps.map((timerComp: any) => {
                        // Try component.webId first (for multi-column), then row.webId (for single column)
                        const timerVal = timerValues[timerComp.webId] || timerValues[row.webId] || '00:00:00.0000000';
                        return {
                            value: timerVal,
                            controlId: timerComp.controlId || '',
                            groupName: timerComp.name || null,
                            senserData: null,
                        };
                    });

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
                        ...barcodeData,
                        ...barcodeValidatorData,
                        ...timerData,
                    ];
                });

                // const sectionKey =
                //     rows.find((r: any) => r.key)?.key;

                const uuid = generateUUID();

                return {
                    startDate: formatDateTimeUTC(startDate || new Date()),
                    endDate: formatDateTimeUTC(endDate || new Date()),
                    key: uuid,
                    formConfigurationSectionId: formConfigId || 0,
                    documentId: documentId,
                    userId: assignUserId,
                    data: dataItems,
                };
            })
        );

        const body = {
            formDefinitionId,
            status: 'COMPLETED',
            userAccountId: assignUserId,
            clientId,
            siteId,
            flow: 0,
            deleted: false,
            completedDate: formatToUTC(new Date()),
            sectionModels: sectionModels.filter(Boolean), // drop nulls if any section had no rows
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

    const currentSection = filteredList[0] || null;






    React.useEffect(() => {
        const rows: any[] = Array.isArray(sectionRowsData?.data) ? sectionRowsData!.data : (sectionRowsData?.data || []);
        if (!rows.length) return;

        // Filter out deleted rows
        rows.filter((row: any) => !row.deleted).forEach((row: any) => {
            const hasImage = row.columns?.some((col: any) => col.components?.filter((c: any) => !c.deleted).some((c: any) => c.component === 'IMAGE'));
            if (!hasImage) return;

            const fileId = getImageIdFromRow(row);
            if (!fileId) return;

            if (imageUrlsByRow[row.webId]) return;

            fetchMediaUrl(String(fileId))
                .then(async (res: any) => {
                    const url = normalizeMediaUrl(res?.data?.redirect || res?.data?.url);
                    if (url) {
                        try { await Image.prefetch(url); } catch { }
                        setImageUrlsByRow(prev => ({ ...prev, [row.webId]: url }));
                    }
                })
                .catch((e) => {
                    console.warn('[IMAGE] failed to fetch url for row', row.webId, e?.message);
                });
        });
    }, [sectionRowsData, currentSectionId, imageUrlsByRow]);

    const getUri = (u: string | null) => normalizeMediaUrl(u);

    async function inspectUrl(url) {
        try {
            const r = await fetch(url, { method: 'GET' });
            console.log('status', r.status);
            console.log('content-type', r.headers.get('content-type'));
            const snippet = await r.text().then(t => t.slice(0, 200));
            console.log('response snippet (first 200 chars):', snippet);
        } catch (e) {
            console.warn('inspectUrl failed', e);
        }
    }
    // Guard to avoid empty URI errors during render
    if (imageUrl) {
        inspectUrl(imageUrl);
        Image.getSize(
            getUri(imageUrl),
            (w, h) => console.log('Image.getSize success', w, h),
            (err) => console.warn('Image.getSize failed', err)
        );
    }




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
                    {isSectionRowsLoading && (
                        <View style={{ padding: getResponsive(16), alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#0088E7" />
                            <Text style={{ marginTop: 8, color: '#19233C' }}>Loading section…</Text>
                        </View>
                    )}
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
                                    <Text style={{ fontWeight: '600' }}>{currentSectionIdx + 1}</Text> of {totalSections || 1}
                                </Text>
                            </View>
                            {/* Checklist */}
                            <View style={{ paddingHorizontal: getResponsive(10), paddingVertical: getResponsive(10) }}>
                                {currentSection.formSectionRowModels
                                    .filter((row) => {
                                        // Skip rows where all columns have null components
                                        if (!row.columns || row.columns.length === 0) return false;
                                        return row.columns.some((col: any) => col.components != null);
                                    })
                                    .map((row, rIdx) => {
                                    const isLastRow = rIdx === currentSection.formSectionRowModels.length - 1;
                                    const hasCamera = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'CAMERA')
                                    );
                                    // TEXT_FIELD row
                                    const hasTextField = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'TEXT_FIELD')
                                    );
                                    const hasSignature = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'SIGNATURE')
                                    );
                                    const hasImage = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === "IMAGE")
                                    );


                                    if (hasImage) {
                                        const imageComp = row.columns?.flatMap((c: any) => c.components || [])?.find((c: any) => c.component === 'IMAGE');
                                        const imageUrl = getImageUrl(row);

                                        console.log('====================================');
                                        console.log('hassss imagee', imageUrl);
                                        console.log('====================================');

                                        return (
                                            <View key={row.webId} style={[styles.mediaRow, { flexDirection: 'row', alignItems: 'center', padding: 0 }]}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>

                                                    <Text style={{ fontSize: getResponsive(13), color: '#19233C' }}>
                                                        {imageComp?.text || 'Image'}
                                                    </Text>
                                                </View>

                                                <View style={[styles.attachmentContainer, { width: '50%', marginRight: getResponsive(8) }]}>
                                                    {imageUrl ? (
                                                        <TouchableOpacity onPress={() => setPreviewUri(imageUrl)} activeOpacity={0.85}>
                                                            <Image
                                                                key={imageUrl}
                                                                source={{ uri: getUri(imageUrl) }}
                                                                style={[styles.multiImgThumb, { width: getResponsive(120), height: getResponsive(90) }]}
                                                                resizeMode="cover"
                                                                onLoad={() => console.log('[IMAGE] loaded for row', row.webId)}
                                                                onError={(e) => console.warn('[IMAGE] failed to render for row', row.webId, e?.nativeEvent)}
                                                            />
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View style={styles.attachmentThumbBox}>
                                                            <View style={[styles.attachmentThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                                                                <ActivityIndicator size="small" color="#1292E6" />
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    }

                                    console.log("hassss imagee", hasImage)

                                    // Multi-column with feedback control (3 columns: question, control, feedback)
                                    const isMultiColumnWithFeedback = row.columns?.length === 3 &&
                                        row.columns[0]?.components?.[0]?.component === 'LABEL' &&
                                        row.columns[1]?.components?.[0] &&
                                        row.columns[1]?.components[0]?.component !== 'LABEL' &&
                                        (row.columns[2]?.components?.[0]?.component === 'TEXT_FIELD' || 
                                         row.columns[2]?.components?.[0]?.component === 'TEXT_AREA');

                                    if (isMultiColumnWithFeedback) {
                                        const labelComp = row.columns[0]?.components[0];
                                        const mainControlComp = row.columns[1]?.components[0];
                                        const feedbackComp = row.columns[2]?.components[0];
                                        const feedbackPlaceholder = feedbackComp?.placeholder || (feedbackComp?.component === 'TEXT_AREA' ? 'Type your comments...' : 'Type your answer...');

                                        // Generate unique IDs for main control and feedback control
                                        const mainControlId = mainControlComp?.webId;
                                        const feedbackControlId = feedbackComp?.webId;

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                {/* Question Column */}
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10), flexShrink: 1 }}>
                                                    <Text style={[styles.radioLabel, { width: undefined, flexShrink: 1 }]}>
                                                        {labelComp?.text}
                                                    </Text>
                                                </View>

                                                {/* Control + Feedback Column */}
                                                <View style={{ width: '50%' }}>
                                                    {/* Main Control Rendering */}
                                                    {mainControlComp?.component === 'SWITCH_BUTTON' && (
                                                        <View style={[styles.radioChoiceRow, { marginBottom: getResponsive(8) }]}>
                                                            <CustomSwitch
                                                                value={switchValues[mainControlId] || false}
                                                                onValueChange={(value) => {
                                                                    setSwitchValues(prev => ({
                                                                        ...prev,
                                                                        [mainControlId]: value
                                                                    }));
                                                                }}
                                                            />
                                                            <Text style={[
                                                                styles.radioOptionText,
                                                                switchValues[mainControlId] && {
                                                                    color: '#0088E7',
                                                                    fontWeight: 'bold',
                                                                }
                                                            ]}>
                                                                {switchValues[mainControlId] ? 'On' : 'Off'}
                                                            </Text>
                                                        </View>
                                                    )}

                                                    {mainControlComp?.component === 'CHECK_BOX' && (
                                                        <TouchableOpacity
                                                            style={[styles.radioChoiceRow, { marginBottom: getResponsive(8) }]}
                                                            activeOpacity={0.8}
                                                            onPress={() => {
                                                                setCheckboxValues(prev => ({
                                                                    ...prev,
                                                                    [mainControlId]: !prev[mainControlId]
                                                                }));
                                                            }}
                                                        >
                                                            <Checkbox selected={checkboxValues[mainControlId] || false} />
                                                            <Text style={[
                                                                styles.radioOptionText,
                                                                checkboxValues[mainControlId] && {
                                                                    color: '#0088E7',
                                                                    fontWeight: 'bold',
                                                                }
                                                            ]}>
                                                                {checkboxValues[mainControlId] ? 'Yes' : 'No'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                    {mainControlComp?.component === 'RATING' && (
                                                        <View style={[styles.radioChoiceRow, { marginBottom: getResponsive(8) }]}>
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <TouchableOpacity
                                                                    key={star}
                                                                    onPress={() => {
                                                                        setRatingValues(prev => ({
                                                                            ...prev,
                                                                            [mainControlId]: star
                                                                        }));
                                                                    }}
                                                                    activeOpacity={0.7}
                                                                    style={{ marginHorizontal: getResponsive(4) }}
                                                                >
                                                                    <Text style={{
                                                                        fontSize: getResponsive(24),
                                                                        color: star <= (ratingValues[mainControlId] || 0) ? '#FFB800' : '#E0E0E0'
                                                                    }}>
                                                                        ★
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    )}

                                                    {mainControlComp?.component === 'DATE' && (
                                                        <View style={{ marginBottom: getResponsive(8) }}>
                                                            <TouchableOpacity
                                                                style={styles.dateInputContainer}
                                                                activeOpacity={0.8}
                                                                onPress={() => {
                                                                    setShowDatePicker(prev => ({ ...prev, [mainControlId]: true }));
                                                                }}
                                                            >
                                                                <View style={styles.dateInputField}>
                                                                    <Text style={styles.dateInputText}>
                                                                        {dateValues[mainControlId] ? new Date(dateValues[mainControlId]).toLocaleDateString('en-US', {
                                                                            month: 'numeric',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        }) : 'Select Date'}
                                                                    </Text>
                                                                    <View style={styles.dateInputSeparator} />
                                                                    <View style={styles.calendarIconContainer}>
                                                                        <CalendarIcon width={getResponsive(20)} height={getResponsive(20)} />
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                            {showDatePicker[mainControlId] && (
                                                                <DateTimePicker
                                                                    value={dateValues[mainControlId] ? new Date(dateValues[mainControlId]) : new Date()}
                                                                    mode="date"
                                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                                    onChange={(event: any, selectedDate?: Date) => {
                                                                        setShowDatePicker(prev => ({ ...prev, [mainControlId]: false }));
                                                                        if (selectedDate) {
                                                                            const formattedDate = selectedDate.toISOString().split('T')[0];
                                                                            setDateValues(prev => ({ ...prev, [mainControlId]: formattedDate }));
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </View>
                                                    )}

                                                    {mainControlComp?.component === 'LOOKUP' && (() => {
                                                        const options = lookupOptions[mainControlId] || [];
                                                        const selectedValue = lookupValues[mainControlId] || '';
                                                        const selectedText = options.find(opt => opt.value === selectedValue)?.text || 'Select an option';
                                                        const showModal = showLookupModal[mainControlId] || false;

                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                <TouchableOpacity
                                                                    style={[styles.textFieldBox, {
                                                                        paddingVertical: getResponsive(12),
                                                                        flexDirection: 'row',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }]}
                                                                    onPress={() => setShowLookupModal(prev => ({ ...prev, [mainControlId]: true }))}
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

                                                                <Modal
                                                                    visible={showModal}
                                                                    transparent
                                                                    animationType="fade"
                                                                    onRequestClose={() => setShowLookupModal(prev => ({ ...prev, [mainControlId]: false }))}
                                                                >
                                                                    <View style={styles.lookupModalOverlay}>
                                                                        <View style={styles.lookupModalContent}>
                                                                            <View style={styles.lookupModalHeader}>
                                                                                <Text style={styles.lookupModalTitle}>
                                                                                    {mainControlComp?.text}
                                                                                </Text>
                                                                                <TouchableOpacity
                                                                                    onPress={() => setShowLookupModal(prev => ({ ...prev, [mainControlId]: false }))}
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
                                                                                                [mainControlId]: option.value
                                                                                            }));
                                                                                            setShowLookupModal(prev => ({ ...prev, [mainControlId]: false }));
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
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'TEXT_FIELD' && (
                                                        <View style={[styles.textFieldBox, { marginBottom: getResponsive(8) }]}>
                                                            <TextInput
                                                                style={styles.textFieldInput}
                                                                multiline
                                                                value={textInputs[mainControlId] || ''}
                                                                onChangeText={(v) =>
                                                                    setTextInputs(prev => ({ ...prev, [mainControlId]: v }))
                                                                }
                                                                placeholder={mainControlComp?.placeholder || 'Type your answer...'}
                                                                placeholderTextColor="#02163980"
                                                            />
                                                        </View>
                                                    )}

                                                    {mainControlComp?.component === 'TEXT_AREA' && (
                                                        <View style={[styles.textFieldBox, { marginBottom: getResponsive(8) }]}>
                                                            <TextInput
                                                                style={[styles.textFieldInput, { minHeight: getResponsive(80) }]}
                                                                multiline
                                                                numberOfLines={4}
                                                                value={textAreaInputs[mainControlId] || ''}
                                                                onChangeText={(v) =>
                                                                    setTextAreaInputs(prev => ({ ...prev, [mainControlId]: v }))
                                                                }
                                                                placeholder={mainControlComp?.placeholder || 'Type your comments...'}
                                                                placeholderTextColor="#02163980"
                                                                textAlignVertical="top"
                                                            />
                                                        </View>
                                                    )}

                                                    {mainControlComp?.component === 'RADIO_BUTTON' && (() => {
                                                        // Get all radio buttons in column 1 for this row
                                                        const radioButtons = row.columns[1]?.components?.filter(c => c.component === 'RADIO_BUTTON') || [];
                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                {radioButtons.map((comp) => (
                                                                    <TouchableOpacity
                                                                        key={comp.webId}
                                                                        style={styles.radioOption}
                                                                        activeOpacity={0.8}
                                                                        onPress={() => {
                                                                            setAnswers(prev => ({
                                                                                ...prev,
                                                                                [currentSection.webId]: {
                                                                                    ...(prev[currentSection.webId] || {}),
                                                                                    [mainControlId]: comp.text,
                                                                                },
                                                                            }));
                                                                        }}
                                                                    >
                                                                        <Radio
                                                                            selected={answers[currentSection.webId]?.[mainControlId] === comp.text}
                                                                        />
                                                                        <Text
                                                                            style={[
                                                                                styles.radioOptionText,
                                                                                answers[currentSection.webId]?.[mainControlId] === comp.text && {
                                                                                    color: '#0088E7',
                                                                                    fontWeight: 'bold',
                                                                                },
                                                                            ]}
                                                                        >
                                                                            {comp.text}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'CAMERA' && (
                                                        <View style={[styles.attachmentContainer, { marginBottom: getResponsive(8) }]}>
                                                            <TouchableOpacity
                                                                style={styles.attachmentCameraBtn}
                                                                onPress={() => handleAddImages(mainControlId)}
                                                                activeOpacity={0.7}
                                                            >
                                                                <CameraIcon />
                                                            </TouchableOpacity>
                                                            <ScrollView
                                                                horizontal
                                                                showsHorizontalScrollIndicator={false}
                                                                style={styles.attachmentScrollView}
                                                                contentContainerStyle={styles.attachmentScrollContent}
                                                            >
                                                                {(rowImages[mainControlId] || []).map(img => (
                                                                    <View key={img.id} style={styles.attachmentThumbBox}>
                                                                        <TouchableOpacity onPress={() => setPreviewUri(img.uri)}>
                                                                            <Image source={{ uri: img.uri }} style={styles.multiImgThumb} />
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity
                                                                            style={styles.attachmentRemove}
                                                                            onPress={() => handleRemoveImage(mainControlId, img.id)}
                                                                        >
                                                                            <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: getResponsive(10) }}>✕</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                ))}
                                                            </ScrollView>
                                                        </View>
                                                    )}

                                                    {mainControlComp?.component === 'SIGNATURE' && (() => {
                                                        signatureRowIdsRef.current.add(mainControlId);
                                                        return (
                                                            <View style={[styles.signatureBox, { width: '100%', overflow: 'hidden', height: getResponsive(150), marginBottom: getResponsive(8) }]}>
                                                                <Signature
                                                                    ref={(r) => { if (r) signatureRefs.current[mainControlId] = r; }}
                                                                    onOK={(base64: string) => {
                                                                        const encoded = (base64 || '').replace(/^data:image\/\w+;base64,/, '');
                                                                        setSignatureValues(prev => ({
                                                                            ...prev,
                                                                            [mainControlId]: { encoded, pathName: undefined }
                                                                        }));
                                                                        if (signatureWaiters.current[mainControlId]) {
                                                                            signatureWaiters.current[mainControlId]!({ pathName: '', encoded });
                                                                            delete signatureWaiters.current[mainControlId];
                                                                        }
                                                                    }}
                                                                    onEnd={() => {
                                                                        safeReadSignature(mainControlId);
                                                                    }}
                                                                    webStyle={`
                                                                        .m-signature-pad--footer { display:none; }
                                                                        body,html { background: transparent; }
                                                                        .m-signature-pad { 
                                                                            box-shadow:none; 
                                                                            border:0; 
                                                                            background: transparent; 
                                                                            width: 100%;
                                                                            height: 100%;
                                                                        }
                                                                        canvas { 
                                                                            background-color: transparent;
                                                                            width: 100% !important;
                                                                            height: 100% !important;
                                                                        }
                                                                    `}
                                                                    backgroundColor="#31AAFF33"
                                                                    penColor="#000"
                                                                    descriptionText=""
                                                                    clearText=""
                                                                    confirmText=""
                                                                    autoClear={false}
                                                                />
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        signatureRefs.current[mainControlId]?.clearSignature();
                                                                        setSignatureValues(prev => {
                                                                            const { [mainControlId]: _, ...rest } = prev;
                                                                            return rest;
                                                                        });
                                                                    }}
                                                                    style={styles.signatureOverlay}
                                                                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                                                                >
                                                                    <RefreshSignatureIcon width={getResponsive(16)} height={getResponsive(16)} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'QR_CODE' && (() => {
                                                        const qrCodeValue = qrCodeValues[mainControlId] || '';
                                                        const showScanner = showQrScanner[mainControlId] || false;

                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                {qrCodeValue ? (
                                                                    <View style={styles.inputFieldContainer}>
                                                                        <TextInput
                                                                            style={styles.inputField}
                                                                            value={qrCodeValue}
                                                                            editable={false}
                                                                            placeholder="Scanned QR Code"
                                                                        />
                                                                        <TouchableOpacity
                                                                            activeOpacity={0.8}
                                                                            onPress={() => {
                                                                                setShowQrScanner(prev => ({ ...prev, [mainControlId]: true }));
                                                                            }}
                                                                        >
                                                                            <View style={styles.qrCodeIconContainer}>
                                                                                <QRCodeScannerIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                ) : (
                                                                    <TouchableOpacity
                                                                        activeOpacity={0.8}
                                                                        onPress={() => {
                                                                            setShowQrScanner(prev => ({ ...prev, [mainControlId]: true }));
                                                                        }}
                                                                    >
                                                                        <View style={styles.qrCodeContainer}>
                                                                            <View style={styles.qrCodeIconContainer}>
                                                                                <QRCodeScannerIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                            </View>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}

                                                                <Modal
                                                                    visible={showScanner}
                                                                    transparent={false}
                                                                    animationType="slide"
                                                                    onRequestClose={() => setShowQrScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                >
                                                                    <View style={styles.qrScannerContainer}>
                                                                        <View style={styles.qrScannerHeader}>
                                                                            <TouchableOpacity
                                                                                onPress={() => setShowQrScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                                style={styles.qrScannerClose}
                                                                            >
                                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                                            </TouchableOpacity>
                                                                            <Text style={styles.qrScannerTitle}>Scan QR Code</Text>
                                                                        </View>
                                                                        <Camera
                                                                            onReadCode={(event: any) => {
                                                                                const scannedValue = event.nativeEvent.codeStringValue;
                                                                                setQrCodeValues(prev => ({ ...prev, [mainControlId]: scannedValue }));
                                                                                setShowQrScanner(prev => ({ ...prev, [mainControlId]: false }));
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
                                                    })()}

                                                    {mainControlComp?.component === 'QR_VALIDATOR' && (() => {
                                                        const expectedValue = mainControlComp?.defaultValue || mainControlComp?.text || '';
                                                        const scannedValue = qrValidatorValues[mainControlId] || '';
                                                        const validationStatus = qrValidatorStatus[mainControlId] || 'pending';
                                                        const showValidatorScanner = showQrValidatorScanner[mainControlId] || false;

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
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                <View style={styles.radioChoiceRow}>
                                                                    {validationStatus !== 'pending' ? (
                                                                        <View style={styles.validationMessageContainer}>
                                                                            <Text style={[styles.validationMessage, { color: validationStatus === 'valid' ? '#28B446' : '#F44336' }]}>
                                                                                {getStatusText()}
                                                                            </Text>
                                                                        </View>
                                                                    ) : (
                                                                        <View style={[styles.qrCodeContainer, styles.validatorIconRow]}>
                                                                            <View style={styles.qrCodeIconContainer}>
                                                                                <QRCodeValidatorIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                            </View>
                                                                        </View>
                                                                    )}
                                                                    <TouchableOpacity
                                                                        style={[styles.scanButton, { backgroundColor: getStatusColor() }]}
                                                                        activeOpacity={0.8}
                                                                        onPress={() => {
                                                                            setShowQrValidatorScanner(prev => ({ ...prev, [mainControlId]: true }));
                                                                        }}
                                                                    >
                                                                        <Text style={[styles.scanButtonText, { color: validationStatus === 'pending' ? '#021639' : '#fff' }]}>Scan</Text>
                                                                    </TouchableOpacity>
                                                                </View>

                                                                <Modal
                                                                    visible={showValidatorScanner}
                                                                    transparent={false}
                                                                    animationType="slide"
                                                                    onRequestClose={() => setShowQrValidatorScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                >
                                                                    <View style={styles.qrScannerContainer}>
                                                                        <View style={styles.qrScannerHeader}>
                                                                            <TouchableOpacity
                                                                                onPress={() => setShowQrValidatorScanner(prev => ({ ...prev, [mainControlId]: false }))}
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

                                                                                setQrValidatorValues(prev => ({ ...prev, [mainControlId]: scannedValue }));
                                                                                setQrValidatorStatus(prev => ({ ...prev, [mainControlId]: isValid ? 'valid' : 'invalid' }));
                                                                                setShowQrValidatorScanner(prev => ({ ...prev, [mainControlId]: false }));

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
                                                    })()}

                                                    {mainControlComp?.component === 'BAR_CODE' && (() => {
                                                        const barcodeValue = barcodeValues[mainControlId] || '';
                                                        const showScanner = showBarcodeScanner[mainControlId] || false;

                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                <View style={styles.inputFieldContainer}>
                                                                    <TextInput
                                                                        style={styles.inputField}
                                                                        value={barcodeValue}
                                                                        editable={false}
                                                                        placeholder="Barcode"
                                                                    />
                                                                    <TouchableOpacity
                                                                        activeOpacity={0.8}
                                                                        onPress={() => {
                                                                            setShowBarcodeScanner(prev => ({ ...prev, [mainControlId]: true }));
                                                                        }}
                                                                    >
                                                                        <View style={styles.barcodeIconContainer}>
                                                                            <BarCodeScannerIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                </View>

                                                                <Modal
                                                                    visible={showScanner}
                                                                    transparent={false}
                                                                    animationType="slide"
                                                                    onRequestClose={() => setShowBarcodeScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                >
                                                                    <View style={styles.qrScannerContainer}>
                                                                        <View style={styles.qrScannerHeader}>
                                                                            <TouchableOpacity
                                                                                onPress={() => setShowBarcodeScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                                style={styles.qrScannerClose}
                                                                            >
                                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                                            </TouchableOpacity>
                                                                            <Text style={styles.qrScannerTitle}>Scan Barcode</Text>
                                                                        </View>
                                                                        <Camera
                                                                            onReadCode={(event: any) => {
                                                                                const scannedValue = event.nativeEvent.codeStringValue;
                                                                                setBarcodeValues(prev => ({ ...prev, [mainControlId]: scannedValue }));
                                                                                setShowBarcodeScanner(prev => ({ ...prev, [mainControlId]: false }));
                                                                                showSuccessToast('Barcode Scanned', `Value: ${scannedValue}`);
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
                                                    })()}

                                                    {mainControlComp?.component === 'BAR_VALIDATOR' && (() => {
                                                        const expectedValue = mainControlComp?.defaultValue || mainControlComp?.text || '';
                                                        const scannedValue = barcodeValidatorValues[mainControlId] || '';
                                                        const validationStatus = barcodeValidatorStatus[mainControlId] || 'pending';
                                                        const showValidatorScanner = showBarcodeValidatorScanner[mainControlId] || false;

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
                                                                default: return 'Validate Barcode';
                                                            }
                                                        };

                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                <View style={styles.radioChoiceRow}>
                                                                    {validationStatus !== 'pending' ? (
                                                                        <View style={styles.validationMessageContainer}>
                                                                            <Text style={[styles.validationMessage, { color: validationStatus === 'valid' ? '#28B446' : '#F44336' }]}>
                                                                                {getStatusText()}
                                                                            </Text>
                                                                        </View>
                                                                    ) : (
                                                                        <View style={[styles.qrCodeContainer, styles.validatorIconRow]}>
                                                                            <View style={styles.qrCodeIconContainer}>
                                                                                <BarCodeValidatorIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                            </View>
                                                                        </View>
                                                                    )}
                                                                    <TouchableOpacity
                                                                        style={[styles.scanButton, { backgroundColor: getStatusColor() }]}
                                                                        activeOpacity={0.8}
                                                                        onPress={() => {
                                                                            setShowBarcodeValidatorScanner(prev => ({ ...prev, [mainControlId]: true }));
                                                                        }}
                                                                    >
                                                                        <Text style={[styles.scanButtonText, { color: validationStatus === 'pending' ? '#021639' : '#fff' }]}>Scan</Text>
                                                                    </TouchableOpacity>
                                                                </View>

                                                                <Modal
                                                                    visible={showValidatorScanner}
                                                                    transparent={false}
                                                                    animationType="slide"
                                                                    onRequestClose={() => setShowBarcodeValidatorScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                >
                                                                    <View style={styles.qrScannerContainer}>
                                                                        <View style={styles.qrScannerHeader}>
                                                                            <TouchableOpacity
                                                                                onPress={() => setShowBarcodeValidatorScanner(prev => ({ ...prev, [mainControlId]: false }))}
                                                                                style={styles.qrScannerClose}
                                                                            >
                                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                                            </TouchableOpacity>
                                                                            <Text style={styles.qrScannerTitle}>Validate Barcode</Text>
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

                                                                                setBarcodeValidatorValues(prev => ({ ...prev, [mainControlId]: scannedValue }));
                                                                                setBarcodeValidatorStatus(prev => ({ ...prev, [mainControlId]: isValid ? 'valid' : 'invalid' }));
                                                                                setShowBarcodeValidatorScanner(prev => ({ ...prev, [mainControlId]: false }));

                                                                                if (isValid) {
                                                                                    showSuccessToast('Barcode Validated', `Value matches: ${scannedValue}`);
                                                                                } else {
                                                                                    showErrorToast('Barcode Invalid', `Expected: ${expectedValue}, Got: ${scannedValue}`);
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
                                                    })()}

                                                    {mainControlComp?.component === 'TIMER' && (() => {
                                                        const timerValue = timerValues[mainControlId] || '00:00:00.0000000';
                                                        const isRunning = timerRunning[mainControlId] || false;

                                                        const handleTimerStart = () => {
                                                            const now = Date.now();
                                                            const elapsed = timerElapsedTime[mainControlId] || 0;
                                                            setTimerStartTime(prev => ({ ...prev, [mainControlId]: now - elapsed }));
                                                            setTimerRunning(prev => ({ ...prev, [mainControlId]: true }));
                                                        };

                                                        const handleTimerPause = () => {
                                                            setTimerRunning(prev => ({ ...prev, [mainControlId]: false }));
                                                        };

                                                        const handleTimerReset = () => {
                                                            setTimerRunning(prev => ({ ...prev, [mainControlId]: false }));
                                                            setTimerValues(prev => ({ ...prev, [mainControlId]: '00:00:00.0000000' }));
                                                            setTimerElapsedTime(prev => ({ ...prev, [mainControlId]: 0 }));
                                                            setTimerStartTime(prev => ({ ...prev, [mainControlId]: 0 }));
                                                        };

                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                <Timer
                                                                    value={timerValue}
                                                                    isRunning={isRunning}
                                                                    onStart={handleTimerStart}
                                                                    onPause={handleTimerPause}
                                                                    onReset={handleTimerReset}
                                                                />
                                                            </View>
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'ATTACHEMENTS' && (() => {
                                                        const files = attachmentsByRow[mainControlId] || [];
                                                        const uploading = isUploadingAttachment[mainControlId] || false;
                                                        const showModal = showAttachmentModal[mainControlId] || false;

                                                        return (
                                                            <View style={{ marginBottom: getResponsive(8) }}>
                                                                <View style={styles.attachmentContainer}>
                                                                    <TouchableOpacity
                                                                        style={styles.attachmentCameraBtn}
                                                                        onPress={() => setShowAttachmentModal(prev => ({ ...prev, [mainControlId]: true }))}
                                                                        activeOpacity={0.7}
                                                                        disabled={uploading}
                                                                    >
                                                                        <AttachmentIcon />
                                                                    </TouchableOpacity>
                                                                    {uploading ? <ActivityIndicator size="small" color="#1292E6" style={{ marginLeft: 6 }} /> : null}

                                                                    <ScrollView
                                                                        horizontal
                                                                        showsHorizontalScrollIndicator={false}
                                                                        style={styles.attachmentScrollView}
                                                                        contentContainerStyle={styles.attachmentScrollContent}
                                                                    >
                                                                        {files.map(file => (
                                                                            <View key={file.id} style={styles.attachmentThumbBox}>
                                                                                <TouchableOpacity onPress={() => file.uri && setPreviewUri(file.uri)}>
                                                                                    <View style={[styles.attachmentThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                                                                                        <Text numberOfLines={1} style={styles.attachmentName}>{file.name || file.id}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                                <TouchableOpacity
                                                                                    style={styles.attachmentRemove}
                                                                                    onPress={() => handleRemoveAttachment(mainControlId, file.id)}
                                                                                >
                                                                                    <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: getResponsive(10) }}>✕</Text>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        ))}
                                                                    </ScrollView>
                                                                </View>

                                                                <Modal
                                                                    visible={showModal}
                                                                    transparent={false}
                                                                    animationType="slide"
                                                                    onRequestClose={() => setShowAttachmentModal(prev => ({ ...prev, [mainControlId]: false }))}
                                                                >
                                                                    <View style={styles.attachmentModalContainer}>
                                                                        <View style={styles.attachmentModalHeader}>
                                                                            <TouchableOpacity
                                                                                onPress={() => setShowAttachmentModal(prev => ({ ...prev, [mainControlId]: false }))}
                                                                                style={styles.attachmentModalClose}
                                                                            >
                                                                                <Text style={styles.attachmentModalCloseText}>✕</Text>
                                                                            </TouchableOpacity>
                                                                            <Text style={styles.attachmentModalTitle}>Upload</Text>
                                                                        </View>

                                                                        <View style={styles.attachmentModalContent}>
                                                                            <View style={styles.attachmentDropZone}>
                                                                                <Text style={styles.attachmentDropIcon}>☁️</Text>
                                                                                <TouchableOpacity
                                                                                    style={styles.attachmentBrowseBtn}
                                                                                    onPress={() => handleAddAttachments(mainControlId)}
                                                                                    disabled={uploading}
                                                                                >
                                                                                    <Text style={styles.attachmentBrowseBtnText}>Browse Files</Text>
                                                                                </TouchableOpacity>
                                                                                <Text style={styles.attachmentDropText}>
                                                                                    {files.length === 0 ? 'No files added.' : `${files.length} file(s) added.`}
                                                                                </Text>
                                                                            </View>

                                                                            {files.length > 0 && (
                                                                                <View style={styles.attachmentFileList}>
                                                                                    {files.map((file, index) => (
                                                                                        <View key={file.id} style={styles.attachmentFileItem}>
                                                                                            <View style={styles.attachmentFileInfo}>
                                                                                                <Text style={styles.attachmentFileName} numberOfLines={1}>
                                                                                                    {file.name}
                                                                                                </Text>
                                                                                                {file.size && (
                                                                                                    <Text style={styles.attachmentFileSize}>
                                                                                                        {(file.size / 1024).toFixed(1)} KB
                                                                                                    </Text>
                                                                                                )}
                                                                                            </View>
                                                                                            <TouchableOpacity
                                                                                                style={styles.attachmentFileDelete}
                                                                                                onPress={() => handleRemoveAttachment(mainControlId, file.id)}
                                                                                            >
                                                                                                <Text style={styles.attachmentFileDeleteText}>✕</Text>
                                                                                            </TouchableOpacity>
                                                                                        </View>
                                                                                    ))}
                                                                                </View>
                                                                            )}

                                                                            {uploading && (
                                                                                <View style={styles.attachmentUploading}>
                                                                                    <ActivityIndicator size="small" color="#0088E7" />
                                                                                    <Text style={styles.attachmentUploadingText}>Uploading...</Text>
                                                                                </View>
                                                                            )}
                                                                        </View>

                                                                        <View style={styles.attachmentModalFooter}>
                                                                            <TouchableOpacity
                                                                                style={styles.attachmentUploadBtn}
                                                                                onPress={() => setShowAttachmentModal(prev => ({ ...prev, [mainControlId]: false }))}
                                                                            >
                                                                                <Text style={styles.attachmentUploadBtnText}>Upload</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    </View>
                                                                </Modal>
                                                            </View>
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'IMAGE' && (() => {
                                                        const imageUrl = getImageUrl(row);
                                                        return (
                                                            <View style={[styles.attachmentContainer, { marginBottom: getResponsive(8) }]}>
                                                                {imageUrl ? (
                                                                    <TouchableOpacity onPress={() => setPreviewUri(imageUrl)} activeOpacity={0.85}>
                                                                        <Image
                                                                            key={imageUrl}
                                                                            source={{ uri: getUri(imageUrl) }}
                                                                            style={[styles.multiImgThumb, { width: getResponsive(120), height: getResponsive(90) }]}
                                                                            resizeMode="cover"
                                                                        />
                                                                    </TouchableOpacity>
                                                                ) : (
                                                                    <View style={styles.attachmentThumbBox}>
                                                                        <View style={[styles.attachmentThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                                                                            <ActivityIndicator size="small" color="#1292E6" />
                                                                        </View>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'PARAGRAPH' && (() => {
                                                        const paragraphText = mainControlComp?.defaultValue || mainControlComp?.text || '';
                                                        return (
                                                            <View style={[styles.textFieldBox, { marginBottom: getResponsive(8) }]}>
                                                                <Text style={[styles.textFieldInput, {
                                                                    color: '#19233C',
                                                                    fontSize: getResponsive(14),
                                                                    lineHeight: getResponsive(20),
                                                                    fontWeight: '400'
                                                                }]}>
                                                                    {paragraphText}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })()}

                                                    {mainControlComp?.component === 'FILE' && (() => {
                                                        const fileId = mainControlComp?.defaultValue || mainControlComp?.attrs?.find(attr => attr.key === 'imageId')?.value || '';
                                                        const fileUrl = fileUrls[mainControlId] || '';

                                                        const handleFilePress = async () => {
                                                            if (!fileUrl && fileId) {
                                                                try {
                                                                    const response = await fetchFileUrl(fileId);
                                                                    const url = (response as any)?.data?.redirect || (response as any)?.data?.url || '';
                                                                    setFileUrls(prev => ({ ...prev, [mainControlId]: url }));

                                                                    if (url) {
                                                                        const canOpen = await Linking.canOpenURL(url);
                                                                        if (canOpen) {
                                                                            await Linking.openURL(url);
                                                                        } else {
                                                                            showErrorToast('Error', 'Cannot open file URL');
                                                                        }
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error fetching file URL:', error);
                                                                    showErrorToast('Error', 'Failed to load file');
                                                                }
                                                            } else if (fileUrl) {
                                                                try {
                                                                    const canOpen = await Linking.canOpenURL(fileUrl);
                                                                    if (canOpen) {
                                                                        await Linking.openURL(fileUrl);
                                                                    } else {
                                                                        showErrorToast('Error', 'Cannot open file URL');
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error opening file URL:', error);
                                                                    showErrorToast('Error', 'Failed to open file');
                                                                }
                                                            }
                                                        };

                                                        return (
                                                            <View style={[styles.textFieldBox, { marginBottom: getResponsive(8) }]}>
                                                                <TouchableOpacity
                                                                    style={[styles.textFieldInput, {
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#0088E7',
                                                                        paddingVertical: getResponsive(12)
                                                                    }]}
                                                                    onPress={handleFilePress}
                                                                    activeOpacity={0.8}
                                                                >
                                                                    <Text style={{
                                                                        color: '#fff',
                                                                        fontSize: getResponsive(14),
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        View File
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        );
                                                    })()}

                                                    {/* Feedback Control */}
                                                    <View style={styles.textFieldBox}>
                                                        <TextInput
                                                            style={[
                                                                styles.textFieldInput,
                                                                feedbackComp?.component === 'TEXT_AREA' && { minHeight: getResponsive(80) }
                                                            ]}
                                                            multiline
                                                            numberOfLines={feedbackComp?.component === 'TEXT_AREA' ? 4 : undefined}
                                                            value={
                                                                feedbackComp?.component === 'TEXT_AREA'
                                                                    ? (textAreaInputs[feedbackControlId] || '')
                                                                    : (textInputs[feedbackControlId] || '')
                                                            }
                                                            onChangeText={(v) => {
                                                                if (feedbackComp?.component === 'TEXT_AREA') {
                                                                    setTextAreaInputs(prev => ({ ...prev, [feedbackControlId]: v }));
                                                                } else {
                                                                    setTextInputs(prev => ({ ...prev, [feedbackControlId]: v }));
                                                                }
                                                            }}
                                                            placeholder={feedbackPlaceholder}
                                                            placeholderTextColor="#02163980"
                                                            textAlignVertical={feedbackComp?.component === 'TEXT_AREA' ? 'top' : 'center'}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    }

                                    if (hasTextField) {
                                        const textComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'TEXT_FIELD');
                                        const placeholder = textComp?.placeholder || 'Type your answer...';

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10), flexShrink: 1 }}>
                                                    <Text style={[styles.radioLabel, { width: undefined, flexShrink: 1 }]}>{row.columns[0]?.components[0]?.text}</Text>
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
                                    const hasCheckbox = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'CHECK_BOX')
                                    );
                                    if (hasCheckbox) {
                                        const checkboxComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'CHECK_BOX');
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
                                    const hasSwitch = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'SWITCH_BUTTON')
                                    );
                                    if (hasSwitch) {
                                        const switchValue = switchValues[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <View style={styles.radioChoiceRow}>
                                                    <CustomSwitch
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
                                    const hasTextArea = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'TEXT_AREA')
                                    );
                                    if (hasTextArea) {
                                        const textAreaComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'TEXT_AREA');
                                        const placeholder = textAreaComp?.placeholder || 'Type your comments...';

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10), flexShrink: 1 }}>
                                                    <Text style={[styles.radioLabel, { width: undefined, flexShrink: 1 }]}>{row.columns[0]?.components[0]?.text}</Text>
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
                                    const hasDate = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'DATE')
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
                                                <View style={styles.radioChoiceRow}>
                                                    <TouchableOpacity
                                                        style={styles.dateInputContainer}
                                                        activeOpacity={0.8}
                                                        onPress={() => {
                                                            setShowDatePicker(prev => ({ ...prev, [row.webId]: true }));
                                                        }}
                                                    >
                                                        <View style={styles.dateInputField}>
                                                            <Text style={styles.dateInputText}>
                                                                {dateValue ? new Date(dateValue).toLocaleDateString('en-US', {
                                                                    month: 'numeric',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                }) : 'Select Date'}
                                                            </Text>
                                                            <View style={styles.dateInputSeparator} />
                                                            <View style={styles.calendarIconContainer}>
                                                                <CalendarIcon width={getResponsive(20)} height={getResponsive(20)} />
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
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

                                    const hasRating = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'RATING')
                                    );


                                    // RATING row
                                    if (hasRating) {
                                        const ratingComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'RATING');
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


                                    const hasLookup = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'LOOKUP')
                                    );

                                    // LOOKUP row
                                    if (hasLookup) {
                                        const lookupComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'LOOKUP');
                                        const options = lookupOptions[row.webId] || [];
                                        const selectedValue = lookupValues[row.webId] || '';
                                        const selectedText = options.find(opt => opt.value === selectedValue)?.text || 'Select an option';
                                        const showModal = showLookupModal[row.webId] || false;

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
                                                        onPress={() => setShowLookupModal(prev => ({ ...prev, [row.webId]: true }))}
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
                                                        visible={showModal}
                                                        transparent
                                                        animationType="fade"
                                                        onRequestClose={() => setShowLookupModal(prev => ({ ...prev, [row.webId]: false }))}
                                                    >
                                                        <View style={styles.lookupModalOverlay}>
                                                            <View style={styles.lookupModalContent}>
                                                                <View style={styles.lookupModalHeader}>
                                                                    <Text style={styles.lookupModalTitle}>
                                                                        {row.columns[0]?.components[0]?.text}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        onPress={() => setShowLookupModal(prev => ({ ...prev, [row.webId]: false }))}
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
                                                                                setShowLookupModal(prev => ({ ...prev, [row.webId]: false }));
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

                                                <View style={[styles.attachmentContainer, { width: '50%', marginRight: getResponsive(8) }]}>
                                                    {/* Camera Icon - Always on the left */}
                                                    <TouchableOpacity
                                                        style={styles.attachmentCameraBtn}
                                                        onPress={() => handleAddImages(row.webId)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <CameraIcon />
                                                    </TouchableOpacity>

                                                    {/* Horizontal Scroll for Image Boxes */}
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        style={styles.attachmentScrollView}
                                                        contentContainerStyle={styles.attachmentScrollContent}
                                                    >
                                                        {(rowImages[row.webId] || []).map(img => (
                                                            <View key={img.id} style={styles.attachmentThumbBox}>
                                                                <TouchableOpacity onPress={() => setPreviewUri(img.uri)}>
                                                                    <Image source={{ uri: img.uri }} style={styles.multiImgThumb} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.attachmentRemove}
                                                                    onPress={() => handleRemoveImage(row.webId, img.id)}
                                                                >
                                                                    <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: getResponsive(10) }}>✕</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            </View>
                                        );
                                    }

                                    // ATTACHEMENTS row (file uploads producing file IDs)
                                    const hasAttachments = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'ATTACHEMENTS')
                                    );
                                    if (hasAttachments) {
                                        const files = attachmentsByRow[row.webId] || [];
                                        const uploading = isUploadingAttachment[row.webId] || false;
                                        const showModal = showAttachmentModal[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={[styles.mediaRow, { flexDirection: 'row', alignItems: 'center', padding: 0 }]}
                                            >
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={{ fontSize: getResponsive(13), color: '#19233C' }}>
                                                        {row.columns[0]?.components[0]?.text || 'Attachments'}
                                                    </Text>
                                                </View>

                                                <View style={[styles.attachmentContainer, { width: '50%', marginRight: getResponsive(8) }]}>
                                                    {/* Camera Icon - Always on the left */}
                                                    <TouchableOpacity
                                                        style={styles.attachmentCameraBtn}
                                                        onPress={() => setShowAttachmentModal(prev => ({ ...prev, [row.webId]: true }))}
                                                        activeOpacity={0.7}
                                                        disabled={uploading}
                                                    >
                                                        <AttachmentIcon />
                                                    </TouchableOpacity>
                                                    {uploading ? <ActivityIndicator size="small" color="#1292E6" style={{ marginLeft: 6 }} /> : null}

                                                    {/* Horizontal Scroll for Image Boxes */}
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        style={styles.attachmentScrollView}
                                                        contentContainerStyle={styles.attachmentScrollContent}
                                                    >
                                                        {files.map(file => (
                                                            <View key={file.id} style={styles.attachmentThumbBox}>
                                                                <TouchableOpacity onPress={() => file.uri && setPreviewUri(file.uri)}>
                                                                    <View style={[styles.attachmentThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                                                                        <Text numberOfLines={1} style={styles.attachmentName}>{file.name || file.id}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.attachmentRemove}
                                                                    onPress={() => handleRemoveAttachment(row.webId, file.id)}
                                                                >
                                                                    <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: getResponsive(10) }}>✕</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                    </ScrollView>
                                                </View>

                                                {/* Attachment Detail Modal */}
                                                <Modal
                                                    visible={showModal}
                                                    transparent={false}
                                                    animationType="slide"
                                                    onRequestClose={() => setShowAttachmentModal(prev => ({ ...prev, [row.webId]: false }))}
                                                >
                                                    <View style={styles.attachmentModalContainer}>
                                                        <View style={styles.attachmentModalHeader}>
                                                            <TouchableOpacity
                                                                onPress={() => setShowAttachmentModal(prev => ({ ...prev, [row.webId]: false }))}
                                                                style={styles.attachmentModalClose}
                                                            >
                                                                <Text style={styles.attachmentModalCloseText}>✕</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.attachmentModalTitle}>Upload</Text>
                                                        </View>

                                                        <View style={styles.attachmentModalContent}>
                                                            <View style={styles.attachmentDropZone}>
                                                                <Text style={styles.attachmentDropIcon}>☁️</Text>
                                                                <TouchableOpacity
                                                                    style={styles.attachmentBrowseBtn}
                                                                    onPress={() => handleAddAttachments(row.webId)}
                                                                    disabled={uploading}
                                                                >
                                                                    <Text style={styles.attachmentBrowseBtnText}>Browse Files</Text>
                                                                </TouchableOpacity>
                                                                <Text style={styles.attachmentDropText}>
                                                                    {files.length === 0 ? 'No files added.' : `${files.length} file(s) added.`}
                                                                </Text>
                                                            </View>

                                                            {files.length > 0 && (
                                                                <View style={styles.attachmentFileList}>
                                                                    {files.map((file, index) => (
                                                                        <View key={file.id} style={styles.attachmentFileItem}>
                                                                            <View style={styles.attachmentFileInfo}>
                                                                                <Text style={styles.attachmentFileName} numberOfLines={1}>
                                                                                    {file.name}
                                                                                </Text>
                                                                                {file.size && (
                                                                                    <Text style={styles.attachmentFileSize}>
                                                                                        {(file.size / 1024).toFixed(1)} KB
                                                                                    </Text>
                                                                                )}
                                                                            </View>
                                                                            <TouchableOpacity
                                                                                style={styles.attachmentFileDelete}
                                                                                onPress={() => handleRemoveAttachment(row.webId, file.id)}
                                                                            >
                                                                                <Text style={styles.attachmentFileDeleteText}>✕</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    ))}
                                                                </View>
                                                            )}

                                                            {uploading && (
                                                                <View style={styles.attachmentUploading}>
                                                                    <ActivityIndicator size="small" color="#0088E7" />
                                                                    <Text style={styles.attachmentUploadingText}>Uploading...</Text>
                                                                </View>
                                                            )}
                                                        </View>

                                                        <View style={styles.attachmentModalFooter}>
                                                            <TouchableOpacity
                                                                style={styles.attachmentUploadBtn}
                                                                onPress={() => setShowAttachmentModal(prev => ({ ...prev, [row.webId]: false }))}
                                                            >
                                                                <Text style={styles.attachmentUploadBtnText}>Upload</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </Modal>
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
                                                    <View style={[styles.signatureBox, { width: '100%', overflow: 'hidden', height: getResponsive(150) }]}>
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
                                                                safeReadSignature(row.webId);
                                                            }}
                                                            webStyle={`
                .m-signature-pad--footer { display:none; }
                body,html { background: transparent; }
                .m-signature-pad { 
                    box-shadow:none; 
                    border:0; 
                    background: transparent; 
                    width: 100%;
                    height: 100%;
                }
                canvas { 
                    background-color: transparent;
                    width: 100% !important;
                    height: 100% !important;
                }
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
                                    const hasQrCode = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'QR_CODE')
                                    );
                                    if (hasQrCode) {
                                        const qrCodeValue = qrCodeValues[row.webId] || '';
                                        const showScanner = showQrScanner[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <View style={styles.radioChoiceRow}>
                                                    {qrCodeValue ? (
                                                        // After scanning - show input field and icon
                                                        <>
                                                            <View style={styles.inputFieldContainer}>
                                                                <TextInput
                                                                    style={styles.inputField}
                                                                    value={qrCodeValue}
                                                                    editable={false}
                                                                    placeholder="Scanned QR Code"
                                                                />
                                                            </View>
                                                            <TouchableOpacity
                                                                activeOpacity={0.8}
                                                                onPress={() => {
                                                                    setShowQrScanner(prev => ({ ...prev, [row.webId]: true }));
                                                                }}
                                                            >
                                                                <View style={styles.qrCodeIconContainer}>
                                                                    <QRCodeScannerIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        </>
                                                    ) : (
                                                        // Initially - show only icon (tap to scan)
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            onPress={() => {
                                                                setShowQrScanner(prev => ({ ...prev, [row.webId]: true }));
                                                            }}
                                                        >
                                                            <View style={styles.qrCodeContainer}>
                                                                <View style={styles.qrCodeIconContainer}>
                                                                    <QRCodeScannerIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                                </View>
                                                                <Text style={styles.qrCodeText}>

                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>

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
                                    const hasQrValidator = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'QR_VALIDATOR')
                                    );
                                    if (hasQrValidator) {
                                        const qrValidatorComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'QR_VALIDATOR');
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
                                                <View style={styles.radioChoiceRow}>
                                                    {validationStatus !== 'pending' ? (
                                                        // After scanning - show validation message
                                                        <View style={styles.validationMessageContainer}>
                                                            <Text style={[styles.validationMessage, { color: validationStatus === 'valid' ? '#28B446' : '#F44336' }]}>
                                                                {getStatusText()}
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        // Initially - show icon and text (keep icon close to Scan)
                                                        <View style={[styles.qrCodeContainer, styles.validatorIconRow]}>
                                                            <View style={styles.qrCodeIconContainer}>
                                                                <QRCodeValidatorIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                            </View>
                                                            <Text style={styles.qrCodeText}>

                                                            </Text>
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        style={[styles.scanButton, { backgroundColor: getStatusColor() }]}
                                                        activeOpacity={0.8}
                                                        onPress={() => {
                                                            setShowQrValidatorScanner(prev => ({ ...prev, [row.webId]: true }));
                                                        }}
                                                    >
                                                        <Text style={[styles.scanButtonText, { color: validationStatus === 'pending' ? '#021639' : '#fff' }]}>Scan</Text>
                                                    </TouchableOpacity>
                                                </View>

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

                                    // BAR_CODE row
                                    const hasBarcode = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'BAR_CODE')
                                    );
                                    if (hasBarcode) {
                                        const barcodeValue = barcodeValues[row.webId] || '';
                                        const showScanner = showBarcodeScanner[row.webId] || false;

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <View style={styles.radioChoiceRow}>
                                                    {/* Always show input field (empty initially) */}
                                                    <View style={styles.inputFieldContainer}>
                                                        <TextInput
                                                            style={styles.inputField}
                                                            value={barcodeValue}
                                                            editable={false}
                                                            placeholder="Barcode"
                                                        />
                                                    </View>
                                                    {/* Icon on the right to trigger scan */}
                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        onPress={() => {
                                                            setShowBarcodeScanner(prev => ({ ...prev, [row.webId]: true }));
                                                        }}
                                                    >
                                                        <View style={styles.barcodeIconContainer}>
                                                            <BarCodeScannerIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Barcode Scanner Modal */}
                                                <Modal
                                                    visible={showScanner}
                                                    transparent={false}
                                                    animationType="slide"
                                                    onRequestClose={() => setShowBarcodeScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                >
                                                    <View style={styles.qrScannerContainer}>
                                                        <View style={styles.qrScannerHeader}>
                                                            <TouchableOpacity
                                                                onPress={() => setShowBarcodeScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                                style={styles.qrScannerClose}
                                                            >
                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.qrScannerTitle}>Scan Barcode</Text>
                                                        </View>

                                                        <Camera
                                                            onReadCode={(event: any) => {
                                                                const scannedValue = event.nativeEvent.codeStringValue;
                                                                setBarcodeValues(prev => ({ ...prev, [row.webId]: scannedValue }));
                                                                setShowBarcodeScanner(prev => ({ ...prev, [row.webId]: false }));
                                                                showSuccessToast('Barcode Scanned', `Value: ${scannedValue}`);
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

                                    // BAR_VALIDATOR row
                                    const hasBarcodeValidator = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'BAR_VALIDATOR')
                                    );
                                    if (hasBarcodeValidator) {
                                        const barcodeValidatorComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'BAR_VALIDATOR');
                                        const expectedValue = barcodeValidatorComp?.defaultValue || barcodeValidatorComp?.text || '';
                                        const scannedValue = barcodeValidatorValues[row.webId] || '';
                                        const validationStatus = barcodeValidatorStatus[row.webId] || 'pending';
                                        const showValidatorScanner = showBarcodeValidatorScanner[row.webId] || false;

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
                                                default: return 'Validate Barcode';
                                            }
                                        };

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <View style={styles.radioChoiceRow}>
                                                    {validationStatus !== 'pending' ? (
                                                        // After scanning - show validation message
                                                        <View style={styles.validationMessageContainer}>
                                                            <Text style={[styles.validationMessage, { color: validationStatus === 'valid' ? '#28B446' : '#F44336' }]}>
                                                                {getStatusText()}
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        // Initially - show icon and text (keep icon close to Scan)
                                                        <View style={[styles.barcodeContainer, styles.validatorIconRow]}>
                                                            <View style={styles.barcodeIconContainer}>
                                                                <BarCodeValidatorIcon width={getResponsive(32)} height={getResponsive(32)} />
                                                            </View>
                                                            <Text style={styles.barcodeText}>

                                                            </Text>
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        style={[styles.scanButton, { backgroundColor: getStatusColor() }]}
                                                        activeOpacity={0.8}
                                                        onPress={() => {
                                                            setShowBarcodeValidatorScanner(prev => ({ ...prev, [row.webId]: true }));
                                                        }}
                                                    >
                                                        <Text style={[styles.scanButtonText, { color: validationStatus === 'pending' ? '#021639' : '#fff' }]}>Scan</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Barcode Validator Scanner Modal */}
                                                <Modal
                                                    visible={showValidatorScanner}
                                                    transparent={false}
                                                    animationType="slide"
                                                    onRequestClose={() => setShowBarcodeValidatorScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                >
                                                    <View style={styles.qrScannerContainer}>
                                                        <View style={styles.qrScannerHeader}>
                                                            <TouchableOpacity
                                                                onPress={() => setShowBarcodeValidatorScanner(prev => ({ ...prev, [row.webId]: false }))}
                                                                style={styles.qrScannerClose}
                                                            >
                                                                <Text style={styles.qrScannerCloseText}>✕</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.qrScannerTitle}>Validate Barcode</Text>
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

                                                                setBarcodeValidatorValues(prev => ({ ...prev, [row.webId]: scannedValue }));
                                                                setBarcodeValidatorStatus(prev => ({ ...prev, [row.webId]: isValid ? 'valid' : 'invalid' }));
                                                                setShowBarcodeValidatorScanner(prev => ({ ...prev, [row.webId]: false }));

                                                                if (isValid) {
                                                                    showSuccessToast('Barcode Validated', `Value matches: ${scannedValue}`);
                                                                } else {
                                                                    showErrorToast('Barcode Invalid', `Expected: ${expectedValue}, Got: ${scannedValue}`);
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

                                    // TIMER row
                                    const hasTimer = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'TIMER')
                                    );
                                    if (hasTimer) {
                                        const timerValue = timerValues[row.webId] || '00:00:00.0000000';
                                        const isRunning = timerRunning[row.webId] || false;

                                        const handleTimerStart = () => {
                                            const now = Date.now();
                                            setTimerStartTime(prev => ({ ...prev, [row.webId]: now }));
                                            setTimerRunning(prev => ({ ...prev, [row.webId]: true }));
                                        };

                                        const handleTimerPause = () => {
                                            if (isRunning) {
                                                // Calculate elapsed time and store it
                                                const now = Date.now();
                                                const currentSessionTime = now - (timerStartTime[row.webId] || now);
                                                const totalElapsed = (timerElapsedTime[row.webId] || 0) + currentSessionTime;

                                                setTimerElapsedTime(prev => ({ ...prev, [row.webId]: totalElapsed }));
                                                setTimerRunning(prev => ({ ...prev, [row.webId]: false }));
                                            }
                                        };

                                        const handleTimerReset = () => {
                                            setTimerRunning(prev => ({ ...prev, [row.webId]: false }));
                                            setTimerStartTime(prev => ({ ...prev, [row.webId]: 0 }));
                                            setTimerElapsedTime(prev => ({ ...prev, [row.webId]: 0 }));
                                            setTimerValues(prev => ({ ...prev, [row.webId]: '00:00:00.0000000' }));
                                        };

                                        return (
                                            <View key={row.webId} style={styles.radioRow}>
                                                <Text style={styles.radioLabel}>
                                                    {row.columns[0]?.components[0]?.text}
                                                </Text>
                                                <Timer
                                                    value={timerValue}
                                                    isRunning={isRunning}
                                                    onStart={handleTimerStart}
                                                    onPause={handleTimerPause}
                                                    onReset={handleTimerReset}
                                                />
                                            </View>
                                        );
                                    }

                                    // PARAGRAPH row
                                    const hasParagraph = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'PARAGRAPH')
                                    );
                                    if (hasParagraph) {
                                        const paragraphComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'PARAGRAPH');
                                        const paragraphText = paragraphComp?.defaultValue || paragraphComp?.text || '';

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={styles.radioLabel}>{row.columns[0]?.components[0]?.text}</Text>
                                                </View>
                                                <View style={[styles.textFieldBox, { width: '50%' }]}>
                                                    <Text style={[styles.textFieldInput, {
                                                        color: '#19233C',
                                                        fontSize: getResponsive(14),
                                                        lineHeight: getResponsive(20),
                                                        fontWeight: '400'
                                                    }]}>
                                                        {paragraphText}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    }

                                    // FILE row
                                    const hasFile = row.columns?.some(col =>
                                        col.components?.some(comp => comp.component === 'FILE')
                                    );
                                    if (hasFile) {
                                        const fileComp = row.columns?.flatMap(c => c.components || [])?.find(c => c.component === 'FILE');
                                        const fileId = fileComp?.defaultValue || fileComp?.attrs?.find(attr => attr.key === 'imageId')?.value || '';
                                        const fileUrl = fileUrls[row.webId] || '';

                                        const handleFilePress = async () => {
                                            if (!fileUrl && fileId) {
                                                try {
                                                    const response = await fetchFileUrl(fileId);
                                                    const url = (response as any)?.data?.redirect || (response as any)?.data?.url || '';
                                                    setFileUrls(prev => ({ ...prev, [row.webId]: url }));

                                                    // Open the file URL in external browser
                                                    if (url) {
                                                        const canOpen = await Linking.canOpenURL(url);
                                                        if (canOpen) {
                                                            await Linking.openURL(url);
                                                        } else {
                                                            showErrorToast('Error', 'Cannot open file URL');
                                                        }
                                                    }
                                                } catch (error) {
                                                    console.error('Error fetching file URL:', error);
                                                    showErrorToast('Error', 'Failed to load file');
                                                }
                                            } else if (fileUrl) {
                                                // Open the cached file URL in external browser
                                                try {
                                                    const canOpen = await Linking.canOpenURL(fileUrl);
                                                    if (canOpen) {
                                                        await Linking.openURL(fileUrl);
                                                    } else {
                                                        showErrorToast('Error', 'Cannot open file URL');
                                                    }
                                                } catch (error) {
                                                    console.error('Error opening file URL:', error);
                                                    showErrorToast('Error', 'Failed to open file');
                                                }
                                            }
                                        };

                                        return (
                                            <View key={row.webId} style={styles.notesRow}>
                                                <View style={{ width: '50%', paddingLeft: getResponsive(10) }}>
                                                    <Text style={styles.radioLabel}>{row.columns[0]?.components[0]?.text}</Text>
                                                </View>
                                                <View style={[styles.textFieldBox, { width: '50%' }]}>
                                                    <TouchableOpacity
                                                        style={[styles.textFieldInput, {
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backgroundColor: '#0088E7',
                                                            paddingVertical: getResponsive(12)
                                                        }]}
                                                        onPress={handleFilePress}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={{
                                                            color: '#fff',
                                                            fontSize: getResponsive(14),
                                                            fontWeight: '600'
                                                        }}>
                                                            View File
                                                        </Text>
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
                                                {(row.columns[1]?.components || []).map((comp, cIdx) =>
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
                            <View style={{ flexDirection: 'row', justifyContent: totalSections <= 1 ? 'flex-end' : 'space-between', marginTop: 10 }}>
                                {totalSections <= 1 ? (
                                    <TouchableOpacity
                                        style={[styles.navBtn, styles.btnPrimary, { flex: 0.5, alignSelf: 'flex-end' }]}
                                        activeOpacity={0.85}
                                        onPress={handleSubmit}
                                        disabled={syncMutation.status === 'pending'}
                                    >
                                        <Text style={styles.submitBtnText}>Submit</Text>
                                        {syncMutation.status === 'pending' ? <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} /> : null}
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        {currentSectionIdx === 0 && totalSections > 1 && (
                                            <TouchableOpacity
                                                style={[styles.navBtn, styles.btnPrimary, { alignSelf: 'flex-end', flex: 1 }]}
                                                activeOpacity={0.85}
                                                onPress={handleNext}
                                            >
                                                <Text style={styles.submitBtnText}>Next</Text>
                                            </TouchableOpacity>
                                        )}

                                        {currentSectionIdx === totalSections - 1 && totalSections > 1 && (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.navBtn, styles.btnPrimary, { flex: 1, marginRight: getResponsive(10) }]}
                                                    activeOpacity={0.85}
                                                    onPress={handlePrev}
                                                >
                                                    <Text style={styles.submitBtnText}>Previous</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.navBtn, styles.btnPrimary, { flex: 1 }]}
                                                    activeOpacity={0.85}
                                                    onPress={handleSubmit}
                                                    disabled={syncMutation.status === 'pending'}
                                                >
                                                    <Text style={styles.submitBtnText}>Submit</Text>
                                                    {syncMutation.status === 'pending' ? <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} /> : null}
                                                </TouchableOpacity>
                                            </>
                                        )}

                                        {currentSectionIdx > 0 && currentSectionIdx < totalSections - 1 && (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.navBtn, styles.btnPrimary, { flex: 1, marginRight: getResponsive(10) }]}
                                                    activeOpacity={0.85}
                                                    onPress={handlePrev}
                                                >
                                                    <Text style={styles.submitBtnText}>Previous</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.navBtn, styles.btnPrimary, { flex: 1 }]}
                                                    activeOpacity={0.85}
                                                    onPress={handleNext}
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
        // light blue like the image
        backgroundColor: '#D9ECFF',
        borderRadius: getResponsive(10),
        paddingVertical: getResponsive(8),
        paddingHorizontal: getResponsive(14),
        minHeight: getResponsive(50),
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#8CC7FF',
    },
    textFieldInput: {
        color: '#021639',
        fontSize: getResponsive(12),
        fontWeight: '500',
        paddingVertical: getResponsive(4),
        paddingHorizontal: getResponsive(4),
        textAlignVertical: 'top',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: getResponsive(10),
        marginTop: getResponsive(10),
    },
    navBtn: {
        borderRadius: getResponsive(10),
        paddingVertical: getResponsive(10),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: getResponsive(40),
        flexDirection: 'row',
    },
    btnPrimary: {
        backgroundColor: '#28B446',
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
        minHeight: getResponsive(80),

    },
    radioLabel: {
        color: '#19233C',
        fontSize: getResponsive(12),
        lineHeight: getResponsive(16),
        width: '40%',

    },
    radioChoiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        width: '60%',
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
        // backgroundColor: '#bbb',
        marginBottom: getResponsive(4),
    },
    attachmentThumb: {
        width: getResponsive(90),
        height: getResponsive(50),
        borderRadius: getResponsive(10),
        backgroundColor: '#E8F4FF',
        paddingHorizontal: getResponsive(6),
    },
    attachmentName: {
        color: '#021639',
        fontSize: getResponsive(9),
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: getResponsive(4),
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
    // New attachment container styles
    attachmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0088E733',
        borderRadius: getResponsive(6),
        padding: getResponsive(8),
        minHeight: getResponsive(60),
    },
    attachmentCameraBtn: {
        marginRight: getResponsive(8),
        padding: getResponsive(4),
    },
    attachmentScrollView: {
        flex: 1,
        maxHeight: getResponsive(60),
    },
    attachmentScrollContent: {
        alignItems: 'center',
        paddingRight: getResponsive(8),
    },
    attachmentThumbBox: {
        marginRight: getResponsive(8),
        position: 'relative',
    },
    attachmentRemove: {
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
    notesRow: {
        backgroundColor: '#F7F9FC',
        borderRadius: getResponsive(12),
        marginBottom: getResponsive(14),
        padding: getResponsive(10),
        flexDirection: 'row',
        minHeight: getResponsive(80),
        alignItems: 'center',
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
        // padding: getResponsive(16),
        flexDirection: 'row',
    },
    signatureBox: {
        borderRadius: getResponsive(10),
        marginTop: getResponsive(10),
        padding: getResponsive(5),
        minHeight: getResponsive(150), // Increased from 100
        minWidth: getResponsive(200), // Increased from 180
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    signatureImg: {
        width: getResponsive(180),
        height: getResponsive(100),
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
    // Attachment Modal Styles
    attachmentModalContainer: {
        flex: 1,
        // height: '80%',
        backgroundColor: '#fff',
        // marginTop: 'auto',
        borderTopLeftRadius: getResponsive(20),
        borderTopRightRadius: getResponsive(20),
    },
    attachmentModalHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getResponsive(20),
        paddingVertical: getResponsive(15),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    attachmentModalClose: {
        width: getResponsive(30),
        height: getResponsive(30),
        borderRadius: getResponsive(15),
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentModalCloseText: {
        fontSize: getResponsive(16),
        color: '#666',
        fontWeight: 'bold',
    },
    attachmentModalTitle: {
        fontSize: getResponsive(18),
        fontWeight: 'bold',
        color: '#19233C',
    },
    attachmentModalContent: {
        flex: 1,
        padding: getResponsive(20),
    },
    attachmentDropZone: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: getResponsive(12),
        padding: getResponsive(40),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        marginBottom: getResponsive(20),
    },
    attachmentDropIcon: {
        fontSize: getResponsive(48),
        marginBottom: getResponsive(16),
    },
    attachmentBrowseBtn: {
        backgroundColor: '#0088E7',
        paddingHorizontal: getResponsive(24),
        paddingVertical: getResponsive(12),
        borderRadius: getResponsive(8),
        marginBottom: getResponsive(8),
    },
    attachmentBrowseBtnText: {
        color: '#fff',
        fontSize: getResponsive(16),
        fontWeight: '600',
    },
    attachmentDropText: {
        fontSize: getResponsive(14),
        color: '#666',
        textAlign: 'center',
    },
    attachmentFileList: {
        marginTop: getResponsive(10),
    },
    attachmentFileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: getResponsive(12),
        paddingHorizontal: getResponsive(16),
        backgroundColor: '#f8f9fa',
        borderRadius: getResponsive(8),
        marginBottom: getResponsive(8),
    },
    attachmentFileInfo: {
        flex: 1,
        marginRight: getResponsive(12),
    },
    attachmentFileName: {
        fontSize: getResponsive(14),
        color: '#19233C',
        fontWeight: '500',
    },
    attachmentFileSize: {
        fontSize: getResponsive(12),
        color: '#666',
        marginTop: getResponsive(2),
    },
    attachmentFileDelete: {
        width: getResponsive(24),
        height: getResponsive(24),
        borderRadius: getResponsive(12),
        backgroundColor: '#ff4757',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentFileDeleteText: {
        color: '#fff',
        fontSize: getResponsive(12),
        fontWeight: 'bold',
    },
    attachmentUploading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: getResponsive(16),
    },
    attachmentUploadingText: {
        marginLeft: getResponsive(8),
        fontSize: getResponsive(14),
        color: '#0088E7',
    },
    attachmentModalFooter: {
        padding: getResponsive(20),
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    attachmentUploadBtn: {
        backgroundColor: '#0088E7',
        paddingVertical: getResponsive(16),
        borderRadius: getResponsive(8),
        alignItems: 'center',
    },
    attachmentUploadBtnText: {
        color: '#fff',
        fontSize: getResponsive(16),
        fontWeight: '600',
    },
    // New styles for QR Code and Barcode controls
    qrCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: getResponsive(12),
        paddingVertical: getResponsive(8),
        borderRadius: getResponsive(8),
        flex: 1,
        marginRight: getResponsive(8),
    },
    qrCodeIconContainer: {
        width: getResponsive(32),
        height: getResponsive(32),
        borderRadius: getResponsive(16),
        // backgroundColor: '#0088E7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: getResponsive(8),
    },
    qrCodeText: {
        fontSize: getResponsive(14),
        color: '#021639',
        fontWeight: '500',
    },
    barcodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: getResponsive(12),
        paddingVertical: getResponsive(8),
        borderRadius: getResponsive(8),
        flex: 1,
        marginRight: getResponsive(8),
    },
    // Used in validators to keep icon close to the Scan button
    validatorIconRow: {
        flex: 0,
        paddingLeft: getResponsive(8),
        marginRight: getResponsive(8),
    },
    barcodeIconContainer: {
        width: getResponsive(32),
        height: getResponsive(32),
        borderRadius: getResponsive(16),
        // backgroundColor: '#0088E7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: getResponsive(8),
    },
    barcodeText: {
        fontSize: getResponsive(14),
        color: '#021639',
        fontWeight: '500',
    },
    scanButton: {
        backgroundColor: '#0088E7',
        paddingHorizontal: getResponsive(16),
        paddingVertical: getResponsive(8),
        borderRadius: getResponsive(6),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: getResponsive(60),
    },
    scanButtonText: {
        color: '#fff',
        fontSize: getResponsive(14),
        fontWeight: '600',
    },
    // New styles for input field and validation message
    inputFieldContainer: {
        flex: 1,
        marginRight: getResponsive(8),
    },
    inputField: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: getResponsive(8),
        paddingHorizontal: getResponsive(12),
        paddingVertical: getResponsive(8),
        fontSize: getResponsive(14),
        color: '#021639',
    },
    validationMessageContainer: {
        flex: 1,
        marginRight: getResponsive(8),
        justifyContent: 'center',
    },
    validationMessage: {
        fontSize: getResponsive(14),
        fontWeight: '600',
        textAlign: 'center',
    },
    // Date control styles
    dateInputContainer: {
        flex: 1,
    },
    dateInputField: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: getResponsive(8),
        flex: 1,
        minWidth: getResponsive(180),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getResponsive(4),
        paddingVertical: getResponsive(12),
        marginVertical: getResponsive(12),
    },
    dateInputText: {
        flex: 1,
        fontSize: getResponsive(14),
        paddingHorizontal: getResponsive(12),
        color: '#021639',
    },
    dateInputSeparator: {
        width: 1,
        height: getResponsive(20),
        backgroundColor: '#E0E0E0',
        marginHorizontal: getResponsive(8),
    },
    calendarIconContainer: {
        width: getResponsive(32),
        height: getResponsive(32),
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: getResponsive(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
});


