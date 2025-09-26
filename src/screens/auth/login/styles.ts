import { StyleSheet } from 'react-native';

export const createStyles = (theme: {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'flex-start',
    },
    gradientBackground: {
      backgroundColor: '#0088E7',
      paddingHorizontal: 20,
      paddingTop: 0,
      flex: 1
    },
    statusArea: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusTime: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    statusIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    statusIcon: {
      color: '#FFFFFF',
      fontSize: 14,
    },
    logoSection: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
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
    loginCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      paddingHorizontal: 30,
      paddingVertical: 30,
    },
    cardTitle: {
      fontSize: 21,
      fontWeight: '600',
      color: '#101828',
      textAlign: 'center',
      fontFamily: 'Poppins',
    },
    cardSubtitle: {
      fontSize: 13,
      fontWeight: '400',
      color: '#475467',
      textAlign: 'center',
      fontFamily: 'Poppins',
    },
    form: {
      marginTop: 30,
    },
    floatingInputContainer: {
      marginBottom: 15,
      position: 'relative',
    },
    floatingInputWrapper: {
      position: 'relative',
    },
    floatingLabelContainer: {
      position: 'absolute',
      left: -2,
      top: 16,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 2,
    },
    floatingLabelContainerActive: {
      top: -8,
      backgroundColor: '#FFFFFF',
      // paddingHorizontal: 4,
      marginLeft: -3,
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
      color: '#9CA3AF',
      transform: [{ translateY: -1 }],
      fontFamily: 'Poppins',
    },
    floatingIcon: {
      height: 25,
      width: 25,
      marginRight: 2,
      top: 2,
    },
    floatingIconActive: {
      transform: [{ translateY: -1 }],
    },
    floatingLabelFocused: {
      color: '#0088E7',
      fontFamily: 'Poppins',
    },
    floatingInput: {
      fontSize: 14,
      color: '#1F2937',
      // paddingVertical: 4,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      width: '100%',
      paddingTop: 15,
      fontFamily: 'Poppins',
    },
    floatingInputFocused: {
      color: '#1F2937',
    },
    underline: {
      height: 1,
      backgroundColor: '#E5E7EB',
      // marginTop: 4,
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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    inputIconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    inputIcon: {
      alignSelf: 'center',
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: '#1F2937',
      paddingVertical: 8,
      paddingRight: 16,
      fontFamily: 'Poppins',
    },
    passwordToggle: {
      position: 'absolute',
      right: 0,
      top: 20,
      paddingHorizontal: 8,
      paddingVertical: 0,
      zIndex: 2,
    },
    passwordToggleIcon: {
      fontSize: 14,
      color: '#9CA3AF',
      fontFamily: 'Poppins',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 32,
      flexDirection: 'row',
      alignItems: 'center',
    },
    forgotPasswordText: {
      color: '#021639',
      fontSize: 14,
      fontWeight: '400',
      fontFamily: 'Poppins',
    },
    forgotPasswordLoader: {
      marginLeft: 8,
    },
    loginButton: {
      backgroundColor: '#0088E7',
      borderRadius: 12,
      paddingVertical: 8,
      alignItems: 'center',
      marginBottom: 18,
      shadowColor: '#0088E7',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 32,
    },
    dividerLine: {
      flex: 1,
      height: 1.2,
      backgroundColor: '#0088E7',
    },
    dividerTextContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    dividerText: {
      color: '#000000',
      fontSize: 19,
      fontWeight: '500',
      paddingHorizontal: 7,
      fontFamily: 'Poppins',
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 18,
      marginBottom: 20,
    },
    socialButton: {
      width: 100,
      height: 60,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    facebookButton: {
      backgroundColor: '#F3F5F5',
    },
    socialIconText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'Poppins',
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 5,
    },
    forgotPasswordLink: {
      fontSize: 14,
      color: 'red',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    signUpContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 24,
    },
    signUpText: {
      fontSize: 14,
      color: '#868696',
      fontFamily: 'Poppins',
    },
    signUpLink: {
      fontSize: 14,
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    // Password strength styles
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
      fontFamily: 'Poppins',
    },
    passwordRequirements: {
      gap: 4,
    },
    passwordRequirement: {
      fontSize: 12,
      fontWeight: '400',
      paddingVertical: 2,
      fontFamily: 'Poppins',
    },
    passwordRequirementMet: {
      color: '#16A34A', // Green for met requirements
    },
    passwordRequirementUnmet: {
      color: '#9CA3AF', // Gray for unmet requirements
    },
    // Error styles
    floatingInputError: {
      borderColor: '#FF6B6B',
      color: '#FF6B6B',
    },
    underlineError: {
      backgroundColor: '#FF6B6B',
    },
    errorText: {
      fontSize: 12,
      color: '#FF6B6B',
      fontFamily: 'Poppins',
      marginTop: 4,
    },
  });