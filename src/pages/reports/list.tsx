import { useCustom, useCustomMutation } from '@refinedev/core';
import { List, DateField, BooleanField } from '@refinedev/antd';
import { Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { API_URL } from '../../providers/constants';

interface AdminReport {
  id: string;
  reason: string;
  reporter: {
    id: string;
    nickname: string;
    email: string;
  };
  price: {
    id: string;
    isActive: boolean;
    productName: string;
    storeName: string;
  };
  createdAt: string;
}

export const ReportList = () => {
  const { query } = useCustom<AdminReport[]>({
    url: `${API_URL}/price/admin/reports`,
    method: 'get',
  });

  const { mutate: deactivate, mutation } = useCustomMutation();
  const isDeactivating = mutation.isPending;

  const handleDeactivate = (priceId: string) => {
    deactivate(
      {
        url: `${API_URL}/price/${priceId}/deactivate`,
        method: 'patch',
        values: {},
      },
      {
        onSuccess: () => {
          void query.refetch();
        },
      },
    );
  };

  const reports = query.data?.data ?? [];

  return (
    <List title="신고 목록" canCreate={false}>
      <Table
        dataSource={reports}
        rowKey="id"
        loading={query.isLoading}
        pagination={{ pageSize: 20 }}
      >
        <Table.Column
          dataIndex="reason"
          title="신고 사유"
          render={(value: string) => <Tag color="red">{value}</Tag>}
        />
        <Table.Column
          title="신고자"
          render={(_: unknown, record: AdminReport) => (
            <Space direction="vertical" size={0}>
              <Typography.Text strong>{record.reporter.nickname}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {record.reporter.email}
              </Typography.Text>
            </Space>
          )}
        />
        <Table.Column
          title="대상 가격 정보"
          render={(_: unknown, record: AdminReport) => (
            <Space direction="vertical" size={0}>
              <Typography.Text strong>{record.price.productName}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {record.price.storeName}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                copyable
                style={{ fontSize: 11 }}
              >
                {record.price.id}
              </Typography.Text>
            </Space>
          )}
        />
        <Table.Column
          title="가격 활성"
          dataIndex={['price', 'isActive']}
          align="center"
          render={(value: boolean) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="createdAt"
          title="신고일"
          render={(value: string) => (
            <DateField value={value} format="YYYY-MM-DD HH:mm" />
          )}
        />
        <Table.Column
          title="조치"
          align="center"
          render={(_: unknown, record: AdminReport) => (
            <Popconfirm
              title="가격 비활성화"
              description="이 가격 정보를 비활성화하시겠습니까?"
              okText="비활성화"
              cancelText="취소"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeactivate(record.price.id)}
              disabled={!record.price.isActive}
            >
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                disabled={!record.price.isActive || isDeactivating}
              >
                {record.price.isActive ? '비활성화' : '비활성'}
              </Button>
            </Popconfirm>
          )}
        />
      </Table>
    </List>
  );
};
