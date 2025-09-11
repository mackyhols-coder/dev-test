import React, { Suspense, useEffect, useState } from "react";
import { Button, Card, Row } from "react-bootstrap";
import { NAVIGATION_PATH } from "@/constants";
import { Client } from "@/types/api/Client";
import DataTable, {DataTableType, GlobalFilterType} from "@/components/DataTable";
import { ActionItemType, CrudActions } from "@/components/CrudActions";
import { Link, useNavigate } from "react-router-dom";
import { mountRoute } from "@/utils/mountRoute";
import Loader from "@/components/Loader";
import ClientService from "@/services/ClientService";
import {ClientFilter} from "@/types/api/filters/ClientFilter";
import {TextFormFieldType} from "@/components/form/TextFormField/TextFormFieldType";

const ClientListing = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState<Date>();

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
  
    return <>
        <Row style={{ justifyContent: "end", margin: "10px 0" }}>
            <Link to={NAVIGATION_PATH.CLIENTS.CREATE.ABSOLUTE}>
                <Button style={{ maxWidth: "fit-content", float: "right" }}>Adicionar</Button>
            </Link>
        </Row>
        <Card >
            <Card.Title></Card.Title>
            <Card.Header>
                <Card.Title>
                    Clientes
                </Card.Title>
            </Card.Header>
            <Suspense fallback={<><Loader /><br /><br /></>}>
                <DataTable<Client, ClientFilter>
                    thin
                    columns={[
                        
                        { Header: "Nome", accessor: "firstName" },
                        { Header: "Sobrenome", accessor: "lastName" },
                        { Header: "Email", accessor: "email" },
                        { Header: "Telefone", accessor: "phoneNumber" },
                        { Header: "Documento", accessor: "documentNumber" },
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
        </Card >
    </>
}

export default ClientListing;