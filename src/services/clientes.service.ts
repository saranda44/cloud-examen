import { ClienteModel } from "../models/cliente.model";
import { subscribeClientToEmail } from "./sns.service";

export const ClienteService = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};

async function getAllClientes() {
    return await ClienteModel.findAll();
}

async function getClienteById(id: number) {
    return await ClienteModel.findById(id);
}

async function createCliente(cliente: any) {
    let clienteCreado = await ClienteModel.create(cliente);
    //suscribir al cliente al correo con sns
    if (clienteCreado) {
        await subscribeClientToEmail(cliente.correo);
    }
    return clienteCreado;
}

async function updateCliente(id: number, cliente: any) {
    return await ClienteModel.update(id, cliente);
}

async function deleteCliente(id: number) {
    return await ClienteModel.remove(id);
}

