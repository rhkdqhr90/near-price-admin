import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export const FaqEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="질문"
          name="question"
          rules={[{ required: true, message: "질문을 입력해주세요." }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="답변"
          name="answer"
          rules={[{ required: true, message: "답변을 입력해주세요." }]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>
        <Form.Item label="카테고리" name="category">
          <Input />
        </Form.Item>
        <Form.Item label="활성여부" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
