import React from "react";
import { Client } from "@/types/api/Client";
import { Formik } from "formik";
import { Button, Col, Form, Row } from "react-bootstrap";
import yup from "@/utils/yup";
import { handlePhoneNumberChange } from "@/helpers/handlePhoneNumberChange";
import CustomModal from "@/components/CustomModal";
import {TextFormField} from "@/components/form/TextFormField/TextFormField";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import {createDatePickerHandler, formatDateForAPI, formatDateForDatePicker, parseDate} from "@/utils/date";

interface ClientEditModalProps {
  show: boolean;
  client: Client | null;
  onHide: () => void;
  onSave: (client: Client) => Promise<void>;
}

const schemaValidation = yup.object().shape({
  firstName: yup.string().required("Nome é obrigatório"),
  lastName: yup.string().required("Sobrenome é obrigatório"),
  phoneNumber: yup.string().required("Telefone é obrigatório"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  documentNumber: yup.string().required("Documento é obrigatório"),
  birthDate: yup.string().required("Data de nascimento é obrigatória"),
  address: yup.object().shape({
    postalCode: yup.string().required("CEP é obrigatório"),
    addressLine: yup.string().required("Endereço é obrigatório"),
    number: yup.string().required("Número é obrigatório"),
    neighborhood: yup.string().required("Bairro é obrigatório"),
    city: yup.string().required("Cidade é obrigatória"),
    state: yup.string().required("Estado é obrigatório"),
  }),
});

const ClientEditModal: React.FC<ClientEditModalProps> = ({
                                                           show,
                                                           client,
                                                           onHide,
                                                           onSave
                                                         }) => {
  const initialValues: Client = client || {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    documentNumber: "",
    birthDate: "",
    address: {
      postalCode: "",
      addressLine: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  };

  return (
    <CustomModal
      show={show}
      onHide={onHide}
      size="xl"
      header={{
        title: "Editar Cliente",
        closeButton: true,
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schemaValidation}
        onSubmit={async (values) => {
          const clientToSave: Client = {
            ...values,
            phoneNumber: values.phoneNumber.replace(/\D/g, ''),
            birthDate: formatDateForAPI(values.birthDate),
            address: {
              ...values.address,
              postalCode: values.address.postalCode.replace(/\D/g, ''),
            },
          };
          await onSave(clientToSave);
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
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="firstName"
                  label="Nome"
                  required
                  placeholder="Nome"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.firstName}
                  formikError={errors.firstName}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="lastName"
                  label="Sobrenome"
                  required
                  placeholder="Sobrenome"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.lastName}
                  formikError={errors.lastName}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="email"
                  label="Email"
                  required
                  placeholder="Email"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.email}
                  formikError={errors.email}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="phoneNumber"
                  label="Telefone"
                  required
                  placeholder="Telefone"
                  handleBlur={handleBlur}
                  handleChange={(event) => handlePhoneNumberChange(event, handleChange)}
                  value={values.phoneNumber}
                  formikError={errors.phoneNumber}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="documentNumber"
                  label="Documento"
                  required
                  placeholder="Documento"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.documentNumber}
                  formikError={errors.documentNumber}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.DATE_PICKER}
                  name="birthDate"
                  label="Data de Nascimento"
                  required
                  placeholderText="dd/mm/aaaa"
                  handleBlur={handleBlur}
                  handleChange={createDatePickerHandler("birthDate", handleChange)}
                  value={formatDateForDatePicker(values.birthDate)}
                  formikError={errors.birthDate}
                  showYearDropdown
                  yearDropdownItemNumber={100}
                  isClearable
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.postalCode"
                  label="CEP"
                  required
                  placeholder="CEP"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.postalCode}
                  formikError={errors.address?.postalCode}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.addressLine"
                  label="Endereço"
                  required
                  placeholder="Endereço"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.addressLine}
                  formikError={errors.address?.addressLine}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.number"
                  label="Número"
                  required
                  placeholder="Número"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.number}
                  formikError={errors.address?.number}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.complement"
                  label="Complemento"
                  placeholder="Complemento"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.complement}
                  formikError={errors.address?.complement}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.neighborhood"
                  label="Bairro"
                  required
                  placeholder="Bairro"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.neighborhood}
                  formikError={errors.address?.neighborhood}
                />
              </Col>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.city"
                  label="Cidade"
                  required
                  placeholder="Cidade"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.city}
                  formikError={errors.address?.city}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <TextFormField
                  componentType={TextFormFieldType.INPUT}
                  name="address.state"
                  label="Estado"
                  required
                  placeholder="Estado"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.address.state}
                  formikError={errors.address?.state}
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

export default ClientEditModal;