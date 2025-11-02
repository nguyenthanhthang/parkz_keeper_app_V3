import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createBusinessProfile,
  getBusinessProfileByManager,
  getBusinessProfileByUser,
  clearError,
} from '../../store/slices/businessProfileSlice';
import { CreateBusinessProfileRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export default function BusinessProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { businessProfile, isLoading, error } = useSelector(
    (state: RootState) => state.businessProfile
  );

  const managerId = user?.id || 0;
  // Check có profile dựa vào businessProfileName hoặc businessName
  const hasProfile = !!businessProfile && (businessProfile.businessProfileName || businessProfile.businessName);
  
  // Debug logs
  useEffect(() => {
    console.log('Screen: managerId:', managerId);
    console.log('Screen: businessProfile:', businessProfile);
    console.log('Screen: hasProfile:', hasProfile);
    console.log('Screen: isLoading:', isLoading);
    console.log('Screen: error:', error);
  }, [managerId, businessProfile, hasProfile, isLoading, error]);

  // Form state (chỉ dùng khi tạo mới)
  const [businessName, setBusinessName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  // Load business profile khi vào screen
  useEffect(() => {
    if (managerId > 0) {
      console.log('Loading business profile for managerId:', managerId);
      // Thử theo managerId endpoint trước (theo API spec)
      dispatch(getBusinessProfileByManager(managerId));
      // Nếu không có, thử theo userId
      // dispatch(getBusinessProfileByUser(managerId));
    }
  }, [managerId, dispatch]);

  // Populate form nếu có profile (để edit) - không dùng vì chỉ hiển thị read-only
  // useEffect(() => {
  //   if (businessProfile && hasProfile) {
  //     setBusinessName(businessProfile.businessProfileName || businessProfile.businessName || '');
  //     setAddress(businessProfile.address || '');
  //     setPhone(businessProfile.phone || '');
  //     setEmail(businessProfile.email || '');
  //   }
  // }, [businessProfile, hasProfile]);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = useCallback((): boolean => {
    if (!businessName.trim()) {
      Alert.alert('Lỗi xác thực', 'Vui lòng nhập tên doanh nghiệp');
      return false;
    }
    // Email validation nếu có
    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Lỗi xác thực', 'Email không hợp lệ');
      return false;
    }
    return true;
  }, [businessName, email]);

  const handleCreateProfile = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const createData: CreateBusinessProfileRequest = {
        businessName: businessName.trim(),
        taxCode: taxCode.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        managerId: managerId,
      };

      await dispatch(createBusinessProfile(createData)).unwrap();
      Alert.alert('Thành công', 'Tạo hồ sơ doanh nghiệp thành công');
      
      // Reload profile sau khi tạo
      dispatch(getBusinessProfileByManager(managerId));
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Tạo hồ sơ doanh nghiệp thất bại');
    }
  }, [
    validateForm,
    businessName,
    taxCode,
    address,
    phone,
    email,
    description,
    website,
    managerId,
    dispatch,
  ]);

  // Show loading khi đang fetch profile
  if (isLoading && !businessProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {hasProfile ? (
          // View Mode - Hiển thị thông tin business profile
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>
                  Hồ sơ Doanh nghiệp
                </Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  Thông tin doanh nghiệp của bạn
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Tên doanh nghiệp:
                  </Text>
                  <Text variant="bodyLarge" style={styles.value}>
                    {businessProfile.businessProfileName || businessProfile.businessName || 'N/A'}
                  </Text>
                </View>

                {businessProfile.businessLicense && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Giấy phép kinh doanh:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.businessLicense}
                    </Text>
                  </View>
                )}

                {businessProfile.taxCode && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Mã số thuế:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.taxCode}
                    </Text>
                  </View>
                )}

                {businessProfile.address && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Địa chỉ:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.address}
                    </Text>
                  </View>
                )}

                {businessProfile.phone && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Số điện thoại:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.phone}
                    </Text>
                  </View>
                )}

                {businessProfile.email && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Email:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.email}
                    </Text>
                  </View>
                )}

                {businessProfile.website && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Website:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.website}
                    </Text>
                  </View>
                )}

                {businessProfile.description && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Mô tả:
                    </Text>
                    <Text variant="bodyLarge" style={styles.value}>
                      {businessProfile.description}
                    </Text>
                  </View>
                )}

                <Text variant="bodySmall" style={styles.note}>
                  💡 Để chỉnh sửa hồ sơ, vui lòng liên hệ admin.
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          // Create Mode - Form tạo business profile
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>
                  Tạo Hồ sơ Doanh nghiệp
                </Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  Vui lòng điền thông tin doanh nghiệp để tiếp tục
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.form}>
                <TextInput
                  label="Tên doanh nghiệp *"
                  placeholder="Nhập tên doanh nghiệp"
                  mode="outlined"
                  value={businessName}
                  onChangeText={setBusinessName}
                  style={styles.input}
                  editable={!isLoading}
                />

                <TextInput
                  label="Mã số thuế"
                  placeholder="Nhập mã số thuế (tùy chọn)"
                  mode="outlined"
                  value={taxCode}
                  onChangeText={setTaxCode}
                  style={styles.input}
                  editable={!isLoading}
                />

                <TextInput
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ (tùy chọn)"
                  mode="outlined"
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                  multiline
                  numberOfLines={2}
                  editable={!isLoading}
                />

                <TextInput
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  mode="outlined"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  editable={!isLoading}
                />

                <TextInput
                  label="Email"
                  placeholder="Nhập email (tùy chọn)"
                  mode="outlined"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!isLoading}
                />

                <TextInput
                  label="Website"
                  placeholder="Nhập website (tùy chọn)"
                  mode="outlined"
                  value={website}
                  onChangeText={setWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!isLoading}
                />

                <TextInput
                  label="Mô tả"
                  placeholder="Nhập mô tả (tùy chọn)"
                  mode="outlined"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                />

                <Button
                  mode="contained"
                  onPress={handleCreateProfile}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.submitButton}
                  buttonColor="#6200ee"
                >
                  Tạo Hồ sơ Doanh nghiệp
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  card: {
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    color: '#757575',
  },
  divider: {
    marginVertical: 16,
  },
  form: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    color: '#757575',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    color: '#333333',
    fontWeight: '400',
  },
  note: {
    marginTop: 16,
    color: '#ff9800',
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
});

