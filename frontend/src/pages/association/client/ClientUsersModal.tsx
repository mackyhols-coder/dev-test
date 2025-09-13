
import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import CustomModal from "@/components/CustomModal";
import { Client } from "@/types/api/Client";
import AssociationService from "@/services/AssociationService";
import Loader from "@/components/Loader";
import { errorHandling } from "@/utils/errorHandling";
import { formatDateForDisplay } from "@/utils/date";
import {FaPlus, FaTrash } from "react-icons/fa";
import { toastr } from "@/utils/toastr";
import DataTable, { GlobalFilterType } from "@/components/DataTable";
import { Suspense } from "react";
import {ClientUserAssociation} from "@/types/api/ClientUserAssociation";
import SelectUserModal from "@/pages/association/user/SelectUserModal";

interface ClientUsersModalProps {
  show: boolean;
  client: Client | null;
  onHide: () => void;
}

const ClientUsersModal: React.FC<ClientUsersModalProps> = ({
                                                             show,
                                                             client,
                                                             onHide
                                                           }) => {
  const [date, setDate] = useState<Date>();
  const [removingAssociationId, setRemovingAssociationId] = useState<string | null>(null);
  const [selectUserModalShow, setSelectUserModalShow] = useState<boolean>(false);

  useEffect(() => {
    if (show && client?.id) {
      setDate(new Date());
    }
  }, [show, client?.id]);

  const handleAssociationsQuery = async (filters: GlobalFilterType[]): Promise<ClientUserAssociation[]> => {
    if (!client?.id) return [];

    try {
      return await AssociationService.getByClientId(client.id);
    } catch (error) {
      return [];
    }
  };

  const handleRemoveAssociation = async (associationId: string, username: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a associação com o usuário "${username}"?`)) {
      return;
    }

    setRemovingAssociationId(associationId);
    try {
      await AssociationService.removeAssociation(associationId);

      toastr({
        title: `Associação com o usuário "${username}" removida com sucesso`,
        icon: "success"
      });

      setDate(new Date());
    } catch (error) {
      errorHandling(error);
    } finally {
      setRemovingAssociationId(null);
    }
  };

  const handleOpenSelectUserModal = () => {
    setSelectUserModalShow(true);
  };
  const handleAssociationCreated = () => {
    setDate(new Date());
  };

  const handleClose = () => {
    setRemovingAssociationId(null);
    onHide();
  };
  const handleCloseSelectUserModal = () => {
    setSelectUserModalShow(false);
  };

  return (
    <>
      <CustomModal
        show={show}
        onHide={handleClose}
        size="xl"
        header={{
          title: `Usuários Associados - ${client?.firstName} ${client?.lastName}`,
          closeButton: true,
        }}
      >
        <Form noValidate>
          <Row style={{ margin: "10px 0"}}>
            <Col className="d-flex justify-content-end">
              <Button
                variant="success"
                onClick={handleOpenSelectUserModal}
                style={{maxWidth: "fit-content"}}
              >
                <FaPlus style={{marginRight: "5px"}} />
                Adicionar
              </Button>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Suspense fallback={<><Loader/><br/><br/></>}>
                <DataTable<ClientUserAssociation, {}>
                  thin
                  columns={[
                    {Header: "Nome de Usuário", accessor: "username"},
                    {
                      Header: "Status",
                      accessor: "isActive",
                      Cell: ({ value }) => (
                        <span
                          className={`badge ${
                            value ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {value ? 'Ativo' : 'Inativo'}
                        </span>
                      )
                    },
                    {
                      Header: "Data de Criação",
                      accessor: "createdAt",
                      Cell: ({ value }) => <span>{formatDateForDisplay(value)}</span>
                    },
                    {
                      Header: "Última Modificação",
                      accessor: "modifiedAt",
                      Cell: ({ value }) => (
                        <span>
                          {value ? formatDateForDisplay(value) : '-'}
                        </span>
                      )
                    },
                    {
                      Header: "Ações",
                      id: "actions",
                      Cell: ({row}) => (
                        <div style={{display: "flex", gap: "5px"}}>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleRemoveAssociation(row.original.id, row.original.username)}
                            disabled={removingAssociationId === row.original.id}
                            title="Remover Associação"
                          >
                            {removingAssociationId === row.original.id ? (
                              <span className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  query={handleAssociationsQuery}
                  queryName={["client", "associations", client?.id, date]}
                />
              </Suspense>
            </Col>
          </Row>
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
        </Form>
      </CustomModal>

      <SelectUserModal
        show={selectUserModalShow}
        client={client}
        onHide={handleCloseSelectUserModal}
        onAssociationCreated={handleAssociationCreated}
      />
    </>
  );
};

export default ClientUsersModal;
