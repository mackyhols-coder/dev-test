import CustomModal from "@/components/CustomModal";
import DataTable, { GlobalFilterType } from "@/components/DataTable";
import AssociationService from "@/services/AssociationService";
import UserService from "@/services/UserService";
import { Client } from "@/types/api/Client";
import { User } from "@/types/api/User";
import { errorHandling } from "@/utils/errorHandling";
import { toastr } from "@/utils/toastr";
import {Suspense, useState} from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import Loader from "@/components/Loader";
import {TextFormFieldType} from "@/components/form/TextFormField/TextFormFieldType";

interface SelectUserModalProps {
  show: boolean;
  client: Client | null;
  onHide: () => void;
  onAssociationCreated: () => void;
}

const SelectUserModal: React.FC<SelectUserModalProps> = ({
                                                           show,
                                                           client,
                                                           onHide,
                                                           onAssociationCreated
                                                         }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [date] = useState<Date>(new Date());

  const handleUsersQuery = async (filters: GlobalFilterType[]): Promise<User[]> => {
    try {
      const users = await UserService.getAll();

      const usernameFilter = filters.find(f => f.name === "username");
      if (usernameFilter && usernameFilter.value) {
        return users.filter(user =>
          user.username.toLowerCase().includes((usernameFilter.value as string).toLowerCase())
        );
      }

      return users;
    } catch (error) {
      return [];
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleAssociateUser = async () => {
    if (!selectedUser || !client?.id) {
      toastr({
        title: "Selecione um usuário para associar",
        icon: "warning"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await AssociationService.createAssociation({
        clientId: client.id,
        userId: selectedUser.id!
      });

      toastr({
        title: `Usuário "${selectedUser.username}" associado com sucesso ao cliente`,
        icon: "success"
      });

      onAssociationCreated();
      handleClose();
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    onHide();
  };

  return (
    <CustomModal
      show={show}
      onHide={handleClose}
      size="lg"
      header={{
        title: `Selecionar Usuário para Associar - ${client?.firstName} ${client?.lastName}`,
        closeButton: true,
      }}
    >
      <Form noValidate>
        <Row>
          <Col md={12}>
            <Suspense fallback={<><Loader/><br/><br/></>}>
              <DataTable<User, { username: string }>
                thin
                columns={[
                  {
                    Header: "Selecionar",
                    id: "select",
                    Cell: ({row}) => (
                      <Form.Check
                        type="radio"
                        name="selectedUser"
                        checked={selectedUser?.id === row.original.id}
                        onChange={() => handleSelectUser(row.original)}
                      />
                    ),
                  },
                  {Header: "Nome de Usuário", accessor: "username"},
                  {Header: "Perfil", accessor: "profile"}
                ]}
                query={handleUsersQuery}
                queryName={["users", "select", date]}
                fetchButton
                cleanButton
                filters={[
                  {
                    componentType: TextFormFieldType.INPUT,
                    name: "username",
                    label: "Nome de Usuário",
                    placeholder: "Digite o nome do usuário"
                  }
                ]}
              />
            </Suspense>
          </Col>
        </Row>
        <br />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {selectedUser && (
              <span className="text-muted">
                Usuário selecionado: <strong>{selectedUser.username}</strong>
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAssociateUser}
              disabled={!selectedUser || isSubmitting}
            >
              {isSubmitting ? "Associando..." : "Associar"}
            </Button>
          </div>
        </div>
      </Form>
    </CustomModal>
  );
};

export default SelectUserModal;
