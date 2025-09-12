import { NAVIGATION_PATH } from "@/constants";
import { ReactQueryKeys } from "@/constants/ReactQueryKeys";
import UserService from "@/services/UserService";
import {UserProfile, userProfileOptions} from "@/types/api/enums/UserProfile";
import { User } from "@/types/api/User";
import { toastr } from "@/utils/toastr";
import yup from "@/utils/yup";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {Suspense} from "react";
import {Loader} from "react-feather";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {Formik} from "formik";
import { TextFormField } from "@/components/form/TextFormField/TextFormField";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import React from "react";

const INITIAL_VALUES: User = {
  username: "",
  password: "",
  profile: UserProfile.Administrator,
};

const schemaValidation = yup.object().shape({
  username: yup.string().required("Nome de usuário é obrigatório"),
  password: yup.string().required("Senha é obrigatória").min(6, "Senha deve ter pelo menos 6 caracteres"),
  profile: yup.number().required("Perfil é obrigatório"),
});

const UserForm = () => {
  const navigate = useNavigate();

  const { data } = useSuspenseQuery<User>({
    queryKey: [ReactQueryKeys.USER],
    meta: {
      fetchFn: async () => {
        return INITIAL_VALUES;
      },
    },
  });

  async function onSubmit(values: User) {
    try {
      await UserService.create(values);
      toastr({ title: "Usuário criado com sucesso", icon: "success" });
      navigate(NAVIGATION_PATH.USERS.LISTING.ABSOLUTE);
    } catch (err: any) {
      toastr({ title: "Erro", text: err.message, icon: "error" });
    }
  }

  const title = "Novo Usuário";

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
                        componentType={TextFormFieldType.INPUT}
                        name="password"
                        label="Senha"
                        type="password"
                        required
                        placeholder="Senha"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.password}
                        formikError={errors.password}
                      />
                    </Col>
                  </Row>
                  <Row>
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
                  <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ marginLeft: 5 }}
                    onClick={() => navigate(NAVIGATION_PATH.USERS.LISTING.ABSOLUTE)}
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

export default UserForm;
