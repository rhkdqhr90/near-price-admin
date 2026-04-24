import { useState } from "react";
import { useCustom } from "@refinedev/core";
import { DateField, List } from "@refinedev/antd";
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { API_URL } from "../../providers/constants";
import { TOKEN_KEY } from "../../providers/constants";

type InquiryStatus = "pending" | "answered" | "closed";

interface InquiryItem {
  id: string;
  title: string;
  content: string;
  email: string;
  status: InquiryStatus;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_META: Record<InquiryStatus, { label: string; color: string }> = {
  pending: { label: "답변 대기", color: "gold" },
  answered: { label: "답변 완료", color: "green" },
  closed: { label: "종료", color: "default" },
};

export const InquiryList = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);

  const { query } = useCustom<InquiryItem[]>({
    url: `${API_URL}/inquiry/admin`,
    method: "get",
  });

  const openReplyModal = (inquiry: InquiryItem) => {
    setSelectedInquiry(inquiry);
    setReplyText(inquiry.adminReply ?? "");
  };

  const closeReplyModal = () => {
    setSelectedInquiry(null);
    setReplyText("");
  };

  const handleSubmitReply = async () => {
    if (!selectedInquiry) {
      return;
    }

    const trimmedReply = replyText.trim();
    if (trimmedReply.length === 0) {
      void messageApi.warning("답변 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSavingReply(true);

      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/inquiry/${selectedInquiry.id}/reply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ adminReply: trimmedReply }),
      });

      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }

      await query.refetch();
      closeReplyModal();
      void messageApi.success("문의 답변이 저장되었습니다.");
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "";
      const statusCode = rawMessage.startsWith("HTTP_")
        ? rawMessage.replace("HTTP_", "")
        : "알 수 없음";
      void messageApi.error(`답변 저장에 실패했습니다. (status: ${statusCode})`);
    } finally {
      setIsSavingReply(false);
    }
  };

  const inquiries = query.data?.data ?? [];

  return (
    <>
      {contextHolder}
      <List title="문의 관리" canCreate={false}>
        <Table<InquiryItem>
          dataSource={inquiries}
          rowKey="id"
          loading={query.isLoading}
          pagination={{ pageSize: 20 }}
        >
          <Table.Column<InquiryItem>
            dataIndex="status"
            title="상태"
            width={120}
            render={(value: InquiryStatus) => {
              const meta = STATUS_META[value] ?? {
                label: value,
                color: "default",
              };
              return <Tag color={meta.color}>{meta.label}</Tag>;
            }}
          />
          <Table.Column<InquiryItem>
            title="문의 내용"
            render={(_: unknown, record) => (
              <Space direction="vertical" size={0}>
                <Typography.Text strong>{record.title}</Typography.Text>
                <Typography.Text type="secondary" ellipsis={{ tooltip: true }}>
                  {record.content}
                </Typography.Text>
              </Space>
            )}
          />
          <Table.Column<InquiryItem>
            dataIndex="email"
            title="작성자 이메일"
            width={240}
            render={(value: string) => (
              <Typography.Text copyable>{value}</Typography.Text>
            )}
          />
          <Table.Column<InquiryItem>
            title="관리자 답변"
            render={(_: unknown, record) => (
              <Typography.Paragraph
                style={{ marginBottom: 0, maxWidth: 320 }}
                ellipsis={{ rows: 2, tooltip: true }}
              >
                {record.adminReply ?? "-"}
              </Typography.Paragraph>
            )}
          />
          <Table.Column<InquiryItem>
            dataIndex="createdAt"
            title="접수일"
            width={170}
            render={(value: string) => (
              <DateField value={value} format="YYYY-MM-DD HH:mm" />
            )}
          />
          <Table.Column<InquiryItem>
            title="작업"
            width={140}
            align="center"
            render={(_: unknown, record) => (
              <Button size="small" onClick={() => openReplyModal(record)}>
                {record.adminReply ? "답변 수정" : "답변 등록"}
              </Button>
            )}
          />
        </Table>
      </List>

      <Modal
        open={selectedInquiry !== null}
        title={selectedInquiry?.adminReply ? "문의 답변 수정" : "문의 답변 등록"}
        okText="저장"
        cancelText="취소"
        onCancel={closeReplyModal}
        onOk={handleSubmitReply}
        confirmLoading={isSavingReply}
        destroyOnClose
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            {selectedInquiry?.title}
          </Typography.Text>
          <Input.TextArea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            rows={8}
            maxLength={2000}
            placeholder="문의 답변을 입력해주세요"
          />
        </Space>
      </Modal>
    </>
  );
};
