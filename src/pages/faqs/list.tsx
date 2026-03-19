import {
  BooleanField,
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
} from "@refinedev/antd";
import { useCustom } from "@refinedev/core";
import { Space, Table } from "antd";
import { API_URL } from "../../providers/constants";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaqGroup {
  category: string | null;
  items: FaqItem[];
}

export const FaqList = () => {
  const { query } = useCustom<FaqGroup[]>({
    url: `${API_URL}/faq`,
    method: "get",
  });

  const flatData: FaqItem[] = (query.data?.data ?? []).flatMap(
    (group: FaqGroup) =>
      group.items.map((item: FaqItem) => ({ ...item, category: group.category }))
  );

  return (
    <List>
      <Table dataSource={flatData} rowKey="id" loading={query.isLoading}>
        <Table.Column dataIndex="question" title="질문" />
        <Table.Column
          dataIndex="category"
          title="카테고리"
          render={(value) => value ?? "-"}
        />
        <Table.Column
          dataIndex="isActive"
          title="활성"
          align="center"
          render={(value) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="createdAt"
          title="생성일"
          render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
        />
        <Table.Column
          title="작업"
          align="center"
          render={(_, record: { id: string }) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} resource="faq" />
              <EditButton hideText size="small" recordItemId={record.id} resource="faq" />
              <DeleteButton hideText size="small" recordItemId={record.id} resource="faq" />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
