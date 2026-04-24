import { useCallback, useMemo, useState } from 'react';
import { useCustom } from '@refinedev/core';
import { DateField, List } from '@refinedev/antd';
import {
  Button,
  Image,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { API_URL, TOKEN_KEY } from '../../providers/constants';

type OwnerApplicationStatus = 'pending' | 'approved' | 'rejected';

interface OwnerApplicationListItem {
  id: string;
  ownerName: string;
  ownerPhone: string;
  businessRegistrationNumberMasked: string;
  proofImageUrl: string;
  status: OwnerApplicationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    nickname: string;
  };
  store: {
    id: string;
    name: string;
    address: string;
  };
}

interface OwnerApplicationDetail extends OwnerApplicationListItem {
  businessRegistrationNumberPlain: string;
}

const STATUS_META: Record<
  OwnerApplicationStatus,
  { label: string; color: string }
> = {
  pending: { label: '심사중', color: 'gold' },
  approved: { label: '승인완료', color: 'green' },
  rejected: { label: '반려', color: 'red' },
};

export const OwnerApplicationList = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedDetail, setSelectedDetail] =
    useState<OwnerApplicationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { query } = useCustom<OwnerApplicationListItem[]>({
    url: `${API_URL}/owner/admin`,
    method: 'get',
  });

  const list = query.data?.data ?? [];

  const withToken = useCallback((): HeadersInit => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const refetchList = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const handleOpenDetail = useCallback(
    async (id: string) => {
      try {
        setIsDetailLoading(true);
        const response = await fetch(`${API_URL}/owner/admin/${id}`, {
          method: 'GET',
          headers: withToken(),
        });
        if (!response.ok) {
          throw new Error(`HTTP_${response.status}`);
        }
        const data = (await response.json()) as OwnerApplicationDetail;
        setSelectedDetail(data);
      } catch {
        void messageApi.error('상세 정보를 불러오지 못했습니다.');
      } finally {
        setIsDetailLoading(false);
      }
    },
    [messageApi, withToken],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        setIsUpdatingStatus(true);
        const response = await fetch(`${API_URL}/owner/admin/${id}/approve`, {
          method: 'PATCH',
          headers: withToken(),
        });
        if (!response.ok) {
          throw new Error(`HTTP_${response.status}`);
        }
        await refetchList();
        void messageApi.success('승인 처리되었습니다.');
      } catch {
        void messageApi.error('승인 처리에 실패했습니다.');
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [messageApi, refetchList, withToken],
  );

  const openRejectModal = useCallback((id: string) => {
    setRejectTargetId(id);
    setRejectionReason('');
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectTargetId(null);
    setRejectionReason('');
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectTargetId) {
      return;
    }

    const trimmed = rejectionReason.trim();
    if (trimmed.length === 0) {
      void messageApi.warning('반려 사유를 입력해주세요.');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await fetch(
        `${API_URL}/owner/admin/${rejectTargetId}/reject`,
        {
          method: 'PATCH',
          headers: withToken(),
          body: JSON.stringify({ rejectionReason: trimmed }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }
      await refetchList();
      closeRejectModal();
      void messageApi.success('반려 처리되었습니다.');
    } catch {
      void messageApi.error('반려 처리에 실패했습니다.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [
    closeRejectModal,
    messageApi,
    refetchList,
    rejectTargetId,
    rejectionReason,
    withToken,
  ]);

  const detailModalTitle = useMemo(
    () =>
      selectedDetail
        ? `${selectedDetail.store.name} · ${selectedDetail.ownerName}`
        : '사장 신청 상세',
    [selectedDetail],
  );

  return (
    <>
      {contextHolder}
      <List title="사장 신청 관리" canCreate={false}>
        <Table<OwnerApplicationListItem>
          dataSource={list}
          rowKey="id"
          loading={query.isLoading}
          pagination={{ pageSize: 20 }}
        >
          <Table.Column<OwnerApplicationListItem>
            dataIndex="status"
            title="상태"
            width={110}
            render={(value: OwnerApplicationStatus) => {
              const meta = STATUS_META[value] ?? {
                label: value,
                color: 'default',
              };
              return <Tag color={meta.color}>{meta.label}</Tag>;
            }}
          />

          <Table.Column<OwnerApplicationListItem>
            title="신청자"
            render={(_, record) => (
              <Space direction="vertical" size={0}>
                <Typography.Text strong>{record.ownerName}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {record.user.nickname} · {record.user.email}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {record.ownerPhone}
                </Typography.Text>
              </Space>
            )}
          />

          <Table.Column<OwnerApplicationListItem>
            title="매장"
            render={(_, record) => (
              <Space direction="vertical" size={0}>
                <Typography.Text strong>{record.store.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {record.store.address}
                </Typography.Text>
              </Space>
            )}
          />

          <Table.Column<OwnerApplicationListItem>
            title="사업자등록번호"
            dataIndex="businessRegistrationNumberMasked"
            width={180}
          />

          <Table.Column<OwnerApplicationListItem>
            title="신청일"
            dataIndex="createdAt"
            width={160}
            render={(value: string) => (
              <DateField value={value} format="YYYY-MM-DD HH:mm" />
            )}
          />

          <Table.Column<OwnerApplicationListItem>
            title="작업"
            width={260}
            render={(_, record) => (
              <Space>
                <Button size="small" onClick={() => void handleOpenDetail(record.id)}>
                  상세
                </Button>
                <Button
                  size="small"
                  type="primary"
                  disabled={record.status === 'approved' || isUpdatingStatus}
                  onClick={() => void handleApprove(record.id)}
                >
                  승인
                </Button>
                <Button
                  size="small"
                  danger
                  disabled={isUpdatingStatus}
                  onClick={() => openRejectModal(record.id)}
                >
                  반려
                </Button>
              </Space>
            )}
          />
        </Table>
      </List>

      <Modal
        open={selectedDetail !== null}
        title={detailModalTitle}
        onCancel={() => setSelectedDetail(null)}
        footer={null}
        destroyOnClose
      >
        {isDetailLoading || !selectedDetail ? (
          <Space
            style={{ width: '100%', justifyContent: 'center', padding: 24 }}
          >
            <Typography.Text type="secondary">로딩 중...</Typography.Text>
          </Space>
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text>
              <strong>사업자등록번호(원문):</strong>{' '}
              {selectedDetail.businessRegistrationNumberPlain}
            </Typography.Text>
            <Typography.Text>
              <strong>사업자등록번호(마스킹):</strong>{' '}
              {selectedDetail.businessRegistrationNumberMasked}
            </Typography.Text>
            <Typography.Text>
              <strong>증빙이미지:</strong>
            </Typography.Text>
            <Image
              src={selectedDetail.proofImageUrl}
              alt="증빙이미지"
              style={{ borderRadius: 8 }}
            />
            {selectedDetail.rejectionReason ? (
              <Typography.Text type="danger">
                <strong>반려 사유:</strong> {selectedDetail.rejectionReason}
              </Typography.Text>
            ) : null}
          </Space>
        )}
      </Modal>

      <Modal
        open={rejectTargetId !== null}
        title="사장 신청 반려"
        okText="반려"
        cancelText="취소"
        onOk={() => void handleReject()}
        onCancel={closeRejectModal}
        okButtonProps={{ danger: true, loading: isUpdatingStatus }}
      >
        <Input.TextArea
          rows={6}
          maxLength={1000}
          placeholder="반려 사유를 입력해주세요"
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
        />
      </Modal>
    </>
  );
};
