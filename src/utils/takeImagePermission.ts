import { Platform, PermissionsAndroid } from 'react-native';

export async function ensureCameraAndMediaPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
        const sdk = Number(Platform.Version);
        const perms: string[] = [PermissionsAndroid.PERMISSIONS.CAMERA];

        if (sdk >= 33) {
            // Android 13+
            perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        } else {
            perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            // WRITE is needed only for very old SDKs when saving to Photos
            if (sdk <= 29) perms.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        }

        const results = await PermissionsAndroid.requestMultiple(perms);
        return perms.every(p => results[p] === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
        return false;
    }
}