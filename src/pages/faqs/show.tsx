import { BooleanField, DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Typography } from "antd";

export const FaqShow = () => {
  const { query } = useShow();
  const record = query.data?.data;

  return (
    <Show isLoading={query.isLoading}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
        <Descriptions.Item label="질문">
          <TextField value={record?.question} />
        </Descriptions.Item>
        <Descriptions.Item label="답변">
          <Typography.Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {record?.answer}
          </Typography.Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="카테고리">
          <TextField value={record?.category} />
        </Descriptions.Item>
        <Descriptions.Item label="활성여부">
          <BooleanField value={record?.isActive} />
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
