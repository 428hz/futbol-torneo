import React from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'url';
};

type Props = {
  visible: boolean;
  title?: string;
  fields: FieldDef[];
  initialValues?: Record<string, string | number | undefined | null>;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

export default function PromptDialog({
  visible,
  title = 'Editar',
  fields,
  initialValues = {},
  confirmText = 'Guardar',
  cancelText = 'Cancelar',
  onCancel,
  onSubmit,
}: Props) {
  const [values, setValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const v: Record<string, string> = {};
    for (const f of fields) {
      const raw = initialValues[f.key];
      v[f.key] = raw === undefined || raw === null ? '' : String(raw);
    }
    setValues(v);
  }, [visible, fields, initialValues]);

  const set = (k: string, val: string) => setValues((p) => ({ ...p, [k]: val }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>

          <View style={{ gap: 8, marginTop: 6 }}>
            {fields.map((f) => (
              <View key={f.key}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ''}
                  onChangeText={(t) => set(f.key, t)}
                  keyboardType={f.keyboardType ?? 'default'}
                  style={s.input}
                />
              </View>
            ))}
          </View>

          <View style={s.row}>
            <Pressable style={[s.btn, s.btnGhost]} onPress={onCancel}>
              <Text style={[s.btnText, s.btnGhostText]}>{cancelText}</Text>
            </Pressable>
            <Pressable style={[s.btn, s.btnPrimary]} onPress={() => onSubmit(values)}>
              <Text style={[s.btnText, s.btnPrimaryText]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 460, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 12, color: '#555', marginBottom: 4, marginLeft: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 10, height: 40 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 14 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnText: { fontWeight: '600' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
  btnGhostText: { color: '#333' },
  btnPrimary: { backgroundColor: '#1677ff' },
  btnPrimaryText: { color: '#fff' },
});