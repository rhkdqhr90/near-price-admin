import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export const NoticeCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
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
        <Form.Item label="활성여부" name="isActive" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
        <Form.Item label="고정여부" name="isPinned" valuePropName="checked" initialValue={false}>
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
