import React, {Suspense, useEffect, useRef, useState} from "react";
import {Button, Card, Col, Row} from "react-bootstrap";
import {NAVIGATION_PATH} from "@/constants";
import {Client} from "@/types/api/Client";
import DataTable, {GlobalFilterType} from "@/components/DataTable";
import {Link, useNavigate} from "react-router-dom";
import Loader from "@/components/Loader";
import ClientService from "@/services/ClientService";
import {ClientFilter} from "@/types/api/filters/ClientFilter";
import {TextFormFieldType} from "@/components/form/TextFormField/TextFormFieldType";
import {FaEdit, FaUpload} from "react-icons/fa";
import ClientEditModal from "@/pages/clients/ClientEditModal";
import {toastr} from "@/utils/toastr";
import {errorHandling} from "@/utils/errorHandling";
import {formatDateForDisplay} from "@/utils/date";
import {ImportJobStatus} from "@/types/ImportJob";

const ClientListing = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [editModalShow, setEditModalShow] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportJobStatus | null>(null);
  
  useEffect(() => {
    setDate(new Date());
  }, []);
  
  useEffect(() => {
    if (importJobId && isImporting) {
      const interval = setInterval(async () => {
        try {
          const status = await ClientService.getImportStatus(importJobId);
          setImportStatus(status);

          if (status.status === 'Completed' || status.status === 'Failed') {
            setIsImporting(false);
            setImportJobId(null);

            if (status.status === 'Completed') {
              toastr({
                title: `Importação concluída! ${status.importedCount || 0} registros importados.`,
                icon: "success"
              });
              setDate(new Date());
            } else {
              toastr({
                title: `Falha na importação: ${status.message}`,
                icon: "error"
              });
            }

            setImportStatus(null);
          }
        } catch (error) {
          console.error('Erro ao verificar status da importação:', error);
          setIsImporting(false);
          setImportJobId(null);
          setImportStatus(null);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [importJobId, isImporting]);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      toastr({title: "Por favor, selecione um arquivo CSV válido", icon: "error"});
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await ClientService.startImport(formData);

      setImportJobId(response.jobId);
      toastr({
        title: response.message,
        icon: "info"
      });

    } catch (error) {
      errorHandling(error);
      setIsImporting(false);
    } finally {
      // Limpar o input file para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return <>
    <Row style={{ margin: "10px 0"}}>
      <Col className="d-flex justify-content-end gap-2">
        <Button
          variant="success"
          onClick={handleImportClick}
          disabled={isImporting}
          style={{maxWidth: "fit-content"}}
        >
          <FaUpload style={{marginRight: "5px"}} />
          {isImporting ? "Importando..." : "Importar CSV"}
        </Button>

        <Link to={NAVIGATION_PATH.CLIENTS.CREATE.ABSOLUTE}>
          <Button style={{maxWidth: "fit-content"}}>Adicionar</Button>
        </Link>
      </Col>
    </Row>

    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept=".csv"
      style={{ display: 'none' }}
    />

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