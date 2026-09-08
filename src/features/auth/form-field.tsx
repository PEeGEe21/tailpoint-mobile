import { ComponentProps, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';

import { Field } from '@/components/ui/primitives';
import { useTheme } from '@/hooks/use-theme';

type FieldProps = ComponentProps<typeof Field>;

export function FormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({
  control,
  name,
  normalize,
  ...props
}: UseControllerProps<TValues, TName> &
  Omit<FieldProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> & {
    normalize?: (value: string) => string;
  }) {
  const { field, fieldState } = useController({ control, name });

  return (
    <Field
      {...props}
      error={fieldState.error?.message}
      onBlur={field.onBlur}
      onChangeText={(value) => field.onChange(normalize?.(value) ?? value)}
      value={typeof field.value === 'string' ? field.value : ''}
    />
  );
}

export function PasswordFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>(
  props: UseControllerProps<TValues, TName> &
    Omit<
      FieldProps,
      | 'value'
      | 'onChangeText'
      | 'onBlur'
      | 'error'
      | 'rightElement'
      | 'secureTextEntry'
    >,
) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      {...props}
      rightElement={
        <Pressable
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => setVisible((current) => !current)}
          style={({ pressed }) => [
            styles.visibilityButton,
            { opacity: pressed ? 0.55 : 1 },
          ]}
        >
          {visible ? (
            <EyeOff color={theme.textSecondary} size={20} />
          ) : (
            <Eye color={theme.textSecondary} size={20} />
          )}
        </Pressable>
      }
      secureTextEntry={!visible}
    />
  );
}

const styles = StyleSheet.create({
  visibilityButton: {
    width: 48,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
