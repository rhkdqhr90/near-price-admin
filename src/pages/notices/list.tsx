import {
  BooleanField,
  DateField,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import { Input, Space, Table } from "antd";

export const NoticeList = () => {
  const { tableProps, sorters } = useTable({
    syncWithLocation: true,
    pagination: { mode: "off" },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="title"
          title="제목"
          sorter
          defaultSortOrder={getDefaultSortOrder("title", sorters)}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="제목 검색" />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="활성"
          align="center"
          render={(value) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="isPinned"
          title="고정"
          align="center"
          render={(value) => <BooleanField value={value} />}
        />
        <Table.Column
          dataIndex="createdAt"
          title="생성일"
          sorter
          defaultSortOrder={getDefaultSortOrder("createdAt", sorters)}
          render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
        />
        <Table.Column
          title="작업"
          align="center"
          render={(_, record: { id: string }) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
