import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { NAVIGATION_PATH } from "@/constants";
import { Client } from "@/types/api/Client";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import { TextFormField } from "@/components/form/TextFormField/TextFormField";
import Loader from "@/components/Loader";
import { toastr } from "@/utils/toastr";
import ClientService from "@/services/ClientService";
import { handlePhoneNumberChange } from "@/helpers/handlePhoneNumberChange";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/ReactQueryKeys";
import yup from "@/utils/yup";
import React, { Suspense } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import {createDatePickerHandler, formatDateForAPI, formatDateForDatePicker, parseDate} from "@/utils/date";

const INITIAL_VALUES: Client = {
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

const ClientForm = () => {
  const navigate = useNavigate();
  

  const { data } = useSuspenseQuery<Client>({
    queryKey: [ReactQueryKeys.CLIENT],
    meta: {
      fetchFn: async () => {
        return INITIAL_VALUES;
      },
    },
  });

  async function onSubmit(values: Client) {
    try {
      const clientToSave: Client = {
        ...values,
        phoneNumber: values.phoneNumber.replace(/\D/g, ''),
        birthDate: formatDateForAPI(values.birthDate),
        address: {
          ...values.address,
          postalCode: values.address.postalCode.replace(/\D/g, ''),
        },
      };

      await ClientService.create(clientToSave);
      toastr({ title: "Cliente criado com sucesso", icon: "success" });
      navigate(NAVIGATION_PATH.CLIENTS.LISTING.ABSOLUTE);
    } catch (err: any) {
      toastr({ title: "Erro", text: err.message, icon: "error" });
    }
  }

  const title = "Novo Cliente";

  return (
    <React.Fragment>
      <Helmet title={title} />
      <Suspense fallback={<><Loader /><br /><br /></>}>
        <Card>
          <Card.Header>
            <Card.Title>{title}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              initialValues={data}
              validationSchema={schemaValidation}
              onSubmit={onSubmit}
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
                        handleChange={(evnt) => handlePhoneNumberChange(evnt, handleChange)}
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
                  <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ marginLeft: 5 }}
                    onClick={() => navigate(NAVIGATION_PATH.CLIENTS.LISTING.ABSOLUTE)}
                  >
                    Voltar
                  </Button>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </Suspense>
    </React.Fragment>
  );
};

export default ClientForm;