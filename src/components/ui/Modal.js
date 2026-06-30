/**
 * Modal — reusable modal overlay + content + action button.
 *
 * Extracted from the repeated modal pattern in:
 *   - CalendarScreen (delete confirmation)
 *   - ActivityDetailScreen (convert type)
 *   - SettingsScreen (multiple modals)
 *   - TrackingScreen (pause, discard, success, setup)
 *
 * This component is opt-in — screens can still use their own Modal
 * directly if they need custom layouts. The shared Modal covers the
 * common case: overlay + centered card + title + message + action button + cancel.
 *
 * Behaviour-preserving: same colours, radii, padding, shadow as existing modals.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal, StyleSheet } from 'react-native';
import { FONT } from '../../theme/typography';
import {
  MODAL_RADIUS,
  MODAL_OVERLAY_OPACITY,
  MODAL_MAX_WIDTH,
  BUTTON_RADIUS,
  BUTTON_PADDING_V,
} from '../../theme/spacing';

export function ModalOverlay({ theme, children, maxWidth = MODAL_MAX_WIDTH }) {
  return (
    <View style={[overlayStyles.overlay, { backgroundColor: `rgba(0,0,0,${MODAL_OVERLAY_OPACITY})` }]}>
      <View
        style={[
          overlayStyles.content,
          {
            maxWidth,
            backgroundColor: theme.surfaceElevated || theme.surface,
            borderRadius: MODAL_RADIUS,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function ModalTitle({ theme, children }) {
  return (
    <Text
      style={{
        fontSize: 22,
        fontFamily: FONT.bold,
        color: theme.text,
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
      }}
    >
      {children}
    </Text>
  );
}

export function ModalMessage({ theme, children }) {
  return (
    <Text
      style={{
        fontSize: 15,
        fontFamily: FONT.regular,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
      }}
    >
      {children}
    </Text>
  );
}

export function ModalButton({ theme, label, onPress, variant = 'primary' }) {
  const bg = variant === 'danger' ? theme.danger : variant === 'cancel' ? theme.surface : theme.primary;
  const color = variant === 'cancel' ? theme.text : '#fff';
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        paddingVertical: BUTTON_PADDING_V,
        borderRadius: BUTTON_RADIUS,
        alignItems: 'center',
        backgroundColor: bg,
        marginTop: variant === 'cancel' ? 10 : 0,
      }}
      onPress={onPress}
    >
      <Text style={{ color, fontSize: 16, fontFamily: FONT.bold }}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * Full shared Modal — wraps RNModal + Overlay + Title + Message + buttons.
 * Use this for simple confirmation modals.
 *
 * Props:
 *   visible, onClose, theme, title, message,
 *   actionLabel, onAction, actionVariant ('primary' | 'danger'),
 *   showCancel (bool), cancelLabel, maxWidth
 */
export default function Modal({
  visible,
  onClose,
  theme,
  title,
  message,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  showCancel = true,
  cancelLabel = 'Cancel',
  maxWidth = MODAL_MAX_WIDTH,
  children,
}) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <ModalOverlay theme={theme} maxWidth={maxWidth}>
        {title && <ModalTitle theme={theme}>{title}</ModalTitle>}
        {message && <ModalMessage theme={theme}>{message}</ModalMessage>}
        {children}
        {actionLabel && (
          <ModalButton theme={theme} label={actionLabel} onPress={onAction} variant={actionVariant} />
        )}
        {showCancel && (
          <ModalButton theme={theme} label={cancelLabel} onPress={onClose} variant="cancel" />
        )}
      </ModalOverlay>
    </RNModal>
  );
}

const overlayStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
});