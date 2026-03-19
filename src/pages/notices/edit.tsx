import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export const NoticeEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="제목"
          name="title"
          rules={[{ required: true, message: "제목을 입력해주세요." }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="내용"
          name="content"
          rules={[{ required: true, message: "내용을 입력해주세요." }]}
        >
          <Input.TextArea rows={8} />
        </Form.Item>
        <Form.Item label="활성여부" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="고정여부" name="isPinned" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
