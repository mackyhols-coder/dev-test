import React, {Suspense, useEffect, useState} from "react";
import {Button, Card, Row} from "react-bootstrap";
import {NAVIGATION_PATH} from "@/constants";
import {Client} from "@/types/api/Client";
import DataTable, {DataTableType, GlobalFilterType} from "@/components/DataTable";
import {Link, useNavigate} from "react-router-dom";
import Loader from "@/components/Loader";
import ClientService from "@/services/ClientService";
import {ClientFilter} from "@/types/api/filters/ClientFilter";
import {TextFormFieldType} from "@/components/form/TextFormField/TextFormFieldType";
import {FaEdit} from "react-icons/fa";
import ClientEditModal from "@/pages/clients/ClientEditModal";
import {toastr} from "@/utils/toastr";
import {errorHandling} from "@/utils/errorHandling";
import {formatDateForDisplay} from "@/utils/date";

const ClientListing = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [editModalShow, setEditModalShow] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  useEffect(() => {
    setDate(new Date());
  }, []);

  const handleClientQuery = async (filters: GlobalFilterType[]): Promise<Client[]> => {
    const documentFilter = filters.find(f => f.name === "document");

    if (documentFilter && documentFilter.value) {
      try {
        const client = await ClientService.getByDocument(encodeURIComponent(documentFilter.value as string));
        return [client];
      } catch (error) {
        return [];
      }
    } else {
      return await ClientService.getAll();
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditModalShow(true);
  };

  const handleSaveClient = async (client: Client) => {
    try {
      if (client.id) {
        await ClientService.update(client.id, client);
        toastr({title: "Cliente atualizado com sucesso", icon: "success"});
        setEditModalShow(false);
        setSelectedClient(null);

        setDate(new Date());
      }
    } catch (error) {
      errorHandling(error);
    }
  };

  const handleCloseModal = () => {
    setEditModalShow(false);
    setSelectedClient(null);
  };

  return <>
    <Row style={{justifyContent: "end", margin: "10px 0"}}>
      <Link to={NAVIGATION_PATH.CLIENTS.CREATE.ABSOLUTE}>
        <Button style={{maxWidth: "fit-content", float: "right"}}>Adicionar</Button>
      </Link>
    </Row>
    <Card>
      <Card.Title></Card.Title>
      <Card.Header>
        <Card.Title>
          Clientes
        </Card.Title>
      </Card.Header>
      <Suspense fallback={<><Loader/><br/><br/></>}>
        <DataTable<Client, ClientFilter>
          thin
          columns={[
            {Header: "Nome", accessor: "firstName"},
            {Header: "Sobrenome", accessor: "lastName"},
            {Header: "Email", accessor: "email"},
            {Header: "Telefone", accessor: "phoneNumber"},
            {Header: "Documento", accessor: "documentNumber"},
            {
              Header: "Data de Nascimento",
              accessor: "birthDate",
              Cell: ({ value }) => <span>{formatDateForDisplay(value)}</span>
            },
            {
              Header: "Ações",
              id: "actions",
              Cell: ({row}) => (
                <div style={{display: "flex", gap: "5px"}}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEditClient(row.original)}
                    title="Editar Cliente"
                  >
                    <FaEdit/>
                  </Button>
                </div>
              ),
            },

          ]}
          query={handleClientQuery}
          fetchButton
          cleanButton
          filters={[
            {
              componentType: TextFormFieldType.INPUT,
              name: "document",
              label: "Documento",
              placeholder: "Digite o documento do cliente"
            }
          ]}
          queryName={["client", "listing", date]}
        />
      </Suspense>
    </Card>

    <ClientEditModal
      show={editModalShow}
      client={selectedClient}
      onHide={handleCloseModal}
      onSave={handleSaveClient}
    />

  </>
}

export default ClientListing;