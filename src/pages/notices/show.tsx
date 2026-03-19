import { BooleanField, DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Typography } from "antd";

export const NoticeShow = () => {
  const { query } = useShow();
  const record = query.data?.data;

  return (
    <Show isLoading={query.isLoading}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
        <Descriptions.Item label="제목">
          <TextField value={record?.title} />
        </Descriptions.Item>
        <Descriptions.Item label="내용">
          <Typography.Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {record?.content}
          </Typography.Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="활성여부">
          <BooleanField value={record?.isActive} />
        </Descriptions.Item>
        <Descriptions.Item label="고정여부">
          <BooleanField value={record?.isPinned} />
        </Descriptions.Item>
        <Descriptions.Item label="생성일">
          <DateField value={record?.createdAt} format="YYYY-MM-DD HH:mm:ss" />
        </Descriptions.Item>
        <Descriptions.Item label="수정일">
          <DateField value={record?.updatedAt} format="YYYY-MM-DD HH:mm:ss" />
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
