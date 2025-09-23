

import { StyleSheet } from 'react-native';

/**
 * Creates themed styles for the RegisterScreen component
 * @param theme - Theme object containing colors and spacing
 * @returns StyleSheet object with all component styles
 */
export const createStyles = (theme: {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#0088E7',
    },
    container: {
      flex: 1,
      backgroundColor: '#0088E7',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    gradientBackground: {
      backgroundColor: '#0088E7',
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 20,
      minHeight: '100%',
    },
    logoSection: {
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 15,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logoIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '600',
      letterSpacing: 1,
      fontFamily: 'Poppins',
    },
    registerCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    cardTitle: {
      fontSize: 21,
      fontWeight: '600',
      color: '#101828',
      textAlign: 'center',
      marginBottom: 5,
      fontFamily: 'Poppins',
    },
    cardSubtitle: {
      fontSize: 13,
      fontWeight: '400',
      color: '#475467',
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Poppins',
    },
    form: {
      paddingBottom: 30,
    },
    floatingInputContainer: {
      // marginBottom: 15,
      paddingHorizontal: 0,
      paddingVertical: 10,
      position: 'relative',
    },
    floatingInputWrapper: {
      position: 'relative',
    },
    floatingLabelContainer: {
      position: 'absolute',
      left: 0,
      top: 15,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 2,
    },
    floatingLabelContainerActive: {
      top: -10,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 4,
      marginLeft: -2,
    },
    floatingLabel: {
      fontWeight: '400',
      color: '#475467',
      fontSize: 16,
      marginLeft: 5,
      backgroundColor: 'transparent',
      fontFamily: 'Poppins',
    },
    floatingLabelActive: {
      fontSize: 14,
      color: '#475467',
      transform: [{ translateY: 2 }],
      fontFamily: 'Poppins',
    },
    floatingIcon: {
      height: 25,
      width: 25,
      marginRight: 2,
      // top: 2,
    },
    floatingIconText: {
      fontSize: 16,
      color: '#475467',
      marginRight: 8,
    },
    floatingIconActive: {
      transform: [{ translateY: 2 }],
    },
    floatingLabelFocused: {
      color: '#475467',
      fontFamily: 'Poppins',
    },
    floatingInput: {
      fontSize: 16,
      color: '#1F2937',
      paddingVertical: 8,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      width: '100%',
      paddingTop: 18,
      fontFamily: 'Poppins',
    },
    floatingInputFocused: {
      color: '#1F2937',
    },
    phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    countrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
      marginRight: 12,
      paddingTop: 20,
      paddingBottom: 18,
    },
    countryCode: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      marginRight: 4,
    },
    dropdownArrow: {
      fontSize: 12,
      color: '#475467',
    },
    phoneInput: {
      flex: 1,
      marginLeft: 0,
    },
    // Phone Number Input Package Styles
    phoneNumberContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      width: '100%',
      paddingTop: 20,
      paddingHorizontal: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    phoneNumberContainerFocused: {
      backgroundColor: 'transparent',
    },
    phoneNumberTextContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingVertical: 0,
      paddingHorizontal: 0,
      marginLeft: 0,
    },
    phoneNumberInput: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      backgroundColor: 'transparent',
      paddingVertical: 0,
      paddingHorizontal: 0,
      height: 'auto',
      borderWidth: 0,
    },
    phoneNumberInputFocused: {
      color: '#1F2937',
    },
    phoneNumberCodeText: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      paddingHorizontal: 8,
    },
    phoneNumberCountryPicker: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      marginRight: 8,
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
      borderRadius: 0,
    },
    phoneNumberFlagButton: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      marginRight: 0,
    },
    customCountryCode: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 8,
    },
    countryCodeText: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      fontWeight: '500',
    },
    // New phone input styles for custom layout
    phoneInputRowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingTop: 18,
    },
    countryCodeSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 5,
      borderRightColor: '#E5E7EB',
      marginRight: 5,
      paddingVertical: 1,
    },
    phoneNumberTextInput: {
      flex: 1,
      marginLeft: 0,
    },
    hiddenPhoneInput: {
      position: 'absolute',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden',
    },
    underline: {
      height: 1,
      backgroundColor: '#E5E7EB',
      width: '100%',
    },
    underlineFocused: {
      backgroundColor: '#0088E7',
      height: 2,
    },
    validationIcon: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      right: -2,
      top: 2,
      zIndex: 1,
    },
    passwordToggle: {
      position: 'absolute',
      right: 0,
      top: 18,
      paddingHorizontal: 8,
      paddingVertical: 0,
      zIndex: 2,
    },
    passwordToggleIcon: {
      fontSize: 16,
      color: '#475467',
      fontFamily: 'Poppins',
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#D1D5DB',
      borderRadius: 4,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
      backgroundColor: '#0088E7',
      borderColor: '#0088E7',
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    termsText: {
      fontSize: 14,
      color: '#6B7280',
      fontFamily: 'Poppins',
      flex: 1,
    },
    termsLink: {
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    signUpButton: {
      backgroundColor: '#0088E7',
      borderRadius: 12,
      paddingVertical: 8,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#0088E7',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    signUpButtonDisabled: {
      opacity: 0.6,
    },
    signUpButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10,
    },
    signInText: {
      fontSize: 14,
      color: '#6B7280',
      fontFamily: 'Poppins',
    },
    signInLink: {
      fontSize: 14,
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    // Debug button styles (development only)
    debugButton: {
      backgroundColor: '#6B7280',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    debugButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    // Legacy styles for backwards compatibility
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    themeToggle: {
      minWidth: 50,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 50,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      top: 16,
      padding: 4,
    },
    eyeText: {
      fontSize: 18,
    },
    placeholder: {
      color: theme.colors.textSecondary,
    },
    passwordStrengthContainer: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      marginBottom: 8,
    },
    passwordStrengthLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    passwordRequirements: {
      gap: 4,
    },
    passwordRequirement: {
      fontSize: 12,
      fontWeight: '400',
      paddingVertical: 2,
    },
    passwordRequirementMet: {
      color: '#16A34A', // Green for met requirements
    },
    passwordRequirementUnmet: {
      color: '#9CA3AF', // Gray for unmet requirements
    },
    passwordStrengthBar: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginRight: 12,
    },
    passwordStrengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    passwordStrengthText: {
      fontSize: 12,
      fontWeight: '500',
      minWidth: 60,
    },
    passwordMatchText: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    registerButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    disabledButton: {
      opacity: 0.6,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loginButton: {
      alignItems: 'center',
      marginTop: 10,
    },
    loginButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    loginLink: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    passwordMatchSuccess: {
      color: '#4caf50',
    },
    passwordMatchError: {
      color: '#ff4757',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'Poppins',
    },
    modalCloseButton: {
      padding: 5,
    },
    modalCloseText: {
      fontSize: 18,
      color: '#475467',
      fontWeight: 'bold',
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    countryItemSelected: {
      backgroundColor: '#EBF8FF',
    },
    countryItemCode: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'Poppins',
      minWidth: 50,
    },
    countryItemName: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      flex: 1,
      marginLeft: 10,
    },
    countryItemDial: {
      fontSize: 16,
      color: '#6B7280',
      fontFamily: 'Poppins',
    },
    // Error styles
    floatingInputError: {
      borderColor: '#FF6B6B',
      color: '#FF6B6B',
    },
    underlineError: {
      backgroundColor: '#FF6B6B',
    },
    errorContainer: {
      marginLeft: 2,
      marginRight: 1,
    },
    errorText: {
      fontSize: 12,
      color: '#FF6B6B',
      fontFamily: 'Poppins',
      width: '100%',
      paddingTop: 4,
    },
    // Date input styles
    dateInputText: {
      fontSize: 16,
      fontFamily: 'Poppins',
      paddingVertical: 4,
      paddingHorizontal: 0,
      width: '100%',
    },
    dateInputTextFilled: {
      color: '#1F2937',
    },
    dateInputTextPlaceholder: {
      color: '#9CA3AF',
    },
  });