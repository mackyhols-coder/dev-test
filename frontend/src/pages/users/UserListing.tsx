import React, {Suspense, useEffect, useState} from "react";
import {Button, Card, Col, Row} from "react-bootstrap";
import {NAVIGATION_PATH} from "@/constants";
import {User} from "@/types/api/User";
import DataTable, {GlobalFilterType} from "@/components/DataTable";
import {Link} from "react-router-dom";
import Loader from "@/components/Loader";
import UserService from "@/services/UserService";
import {UserFilter} from "@/types/api/filters/UserFilter";
import {TextFormFieldType} from "@/components/form/TextFormField/TextFormFieldType";
import {FaEdit} from "react-icons/fa";
import UserEditModal from "@/pages/users/UserEditModal";
import {toastr} from "@/utils/toastr";
import {errorHandling} from "@/utils/errorHandling";
import {UserProfile} from "@/types/api/enums/UserProfile";

const UserListing = () => {
  const [date, setDate] = useState<Date>();
  const [editModalShow, setEditModalShow] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  const handleUserQuery = async (filters: GlobalFilterType[]): Promise<User[]> => {
    const usernameFilter = filters.find(f => f.name === "username");

    if (usernameFilter && usernameFilter.value) {
      const allUsers = await UserService.getAll();
      return allUsers.filter(user =>
        user.username.toLowerCase().includes((usernameFilter.value as string).toLowerCase())
      );
    } else {
      return await UserService.getAll();
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalShow(true);
  };

  const handleSaveUser = async (user: User) => {
    try {
      if (user.id) {
        await UserService.update(user.id, user);
        toastr({title: "Usuário atualizado com sucesso", icon: "success"});
        setEditModalShow(false);
        setSelectedUser(null);
        setDate(new Date());
      }
    } catch (error) {
      errorHandling(error);
    }
  };

  const handleCloseModal = () => {
    setEditModalShow(false);
    setSelectedUser(null);
  };

  const getProfileName = (profile: UserProfile) => {
    if (typeof profile === 'string') {
      switch (profile) {
        case 'Administrator':
          return "Administrador";
        default:
          return "Desconhecido";
      }
    }

    // Se vem como número do enum
    switch (profile) {
      case UserProfile.Administrator:
        return "Administrador";
      default:
        return "Desconhecido";
    }
  };

  return <>
    <Row style={{ margin: "10px 0"}}>
      <Col className="d-flex justify-content-end gap-2">
        <Link to={NAVIGATION_PATH.USERS.CREATE.ABSOLUTE}>
          <Button style={{maxWidth: "fit-content"}}>Adicionar</Button>
        </Link>
      </Col>
    </Row>

    <Card>
      <Card.Title></Card.Title>
      <Card.Header>
        <Card.Title>
          Usuários
        </Card.Title>
      </Card.Header>
      <Suspense fallback={<><Loader/><br/><br/></>}>
        <DataTable<User, UserFilter>
          thin
          columns={[
            {Header: "Nome de Usuário", accessor: "username"},
            {
              Header: "Perfil",
              accessor: "profile",
              Cell: ({ value }) => <span>{getProfileName(value)}</span>
            },
            {
              Header: "Ações",
              id: "actions",
              Cell: ({row}) => (
                <div style={{display: "flex", gap: "5px"}}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEditUser(row.original)}
                    title="Editar Usuário"
                  >
                    <FaEdit/>
                  </Button>
                </div>
              ),
            },
          ]}
          query={handleUserQuery}
          fetchButton
          cleanButton
          filters={[
            {
              componentType: TextFormFieldType.INPUT,
              name: "username",
              label: "Nome de Usuário",
              placeholder: "Digite o nome de usuário"
            }
          ]}
          queryName={["user", "listing", date]}
        />
      </Suspense>
    </Card>

    <UserEditModal
      show={editModalShow}
      user={selectedUser}
      onHide={handleCloseModal}
      onSave={handleSaveUser}
    />

  </>
}

export default UserListing;
