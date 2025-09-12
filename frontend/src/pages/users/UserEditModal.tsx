import CustomModal from "@/components/CustomModal";
import { TextFormField } from "@/components/form/TextFormField/TextFormField";
import { UserProfile, userProfileOptions } from "@/types/api/enums/UserProfile";
import { User } from "@/types/api/User";
import yup from "@/utils/yup";
import {Form, Formik } from "formik";
import {Button, Col, Row} from "react-bootstrap";
import {TextFormFieldType} from "@/components/form/TextFormField/TextFormFieldType";

interface UserEditModalProps {
  show: boolean;
  user: User | null;
  onHide: () => void;
  onSave: (user: User) => Promise<void>;
}

const schemaValidation = yup.object().shape({
  username: yup.string().required("Nome de usuário é obrigatório"),
  profile: yup.number().required("Perfil é obrigatório"),
});

const UserEditModal: React.FC<UserEditModalProps> = ({
                                                       show,
                                                       user,
                                                       onHide,
                                                       onSave
                                                     }) => {
  const initialValues: User = user || {
    username: "",
    profile: UserProfile.Administrator,
  };

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      size="lg"
      header={{
        title: "Editar Usuário",
        closeButton: true,
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schemaValidation}
        onSubmit={async (values) => {
          await onSave(values);
        }}
        enableReinitialize={true}
      >
        {({
            handleSubmit,
            handleChange,
            handleBlur,
            errors,
            values,
            isSubmitting,
            isValid,
          }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="username"
                  label="Nome de Usuário"
                  required
                  placeholder="Nome de Usuário"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.username}
                  formikError={errors.username}
                />
              </Col>
              <Col md={6}>
                <TextFormField
                  componentType={TextFormFieldType.SELECT}
                  name="profile"
                  label="Perfil"
                  required
                  placeholder="Selecione o perfil"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.profile}
                  formikError={errors.profile}
                  options={userProfileOptions()}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                />
              </Col>
            </Row>
            <br />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button
                variant="secondary"
                onClick={onHide}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
};

export default UserEditModal;
