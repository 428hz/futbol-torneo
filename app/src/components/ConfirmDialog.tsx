import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible, title='Confirmar', message='¿Estás seguro?',
  confirmText='Aceptar', cancelText='Cancelar', onConfirm, onCancel
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.msg}>{message}</Text>
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
              <Text style={[styles.btnText, styles.btnGhostText]}>{cancelText}</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onConfirm}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', alignItems:'center', justifyContent:'center' },
  card: { width:'85%', maxWidth:420, backgroundColor:'#fff', borderRadius:12, padding:16, gap:8 },
  title: { fontSize:18, fontWeight:'700' },
  msg: { fontSize:14, color:'#333', marginTop:4 },
  row: { flexDirection:'row', justifyContent:'flex-end', gap:8, marginTop:12 },
  btn: { paddingVertical:10, paddingHorizontal:16, borderRadius:8 },
  btnText: { fontWeight:'600' },
  btnGhost: { backgroundColor:'transparent', borderWidth:1, borderColor:'#ccc' },
  btnGhostText: { color:'#333' },
  btnPrimary: { backgroundColor:'#1677ff' },
  btnPrimaryText: { color:'#fff' },
});