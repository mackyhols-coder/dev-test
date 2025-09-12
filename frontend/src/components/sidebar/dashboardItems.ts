import { SidebarItemsType } from "@/types/sidebar";
import { NAVIGATION_PATH } from "@/constants";
import { UserProfile } from "@/types/api/enums/UserProfile";
import {FaRegAddressBook, FaUsers} from "react-icons/fa";

// PAGES
const CLIENTS_PAGE: SidebarItemsType = { href: NAVIGATION_PATH.CLIENTS.LISTING.ABSOLUTE, title: "Clientes", icon: FaRegAddressBook }
const USERS_PAGE: SidebarItemsType = { href: NAVIGATION_PATH.USERS.LISTING.ABSOLUTE, title: "Usuários", icon: FaUsers }

export const SIDEBAR = {
    [UserProfile.Administrator]: [
        {
            title: "Gestão",
            pages: [CLIENTS_PAGE, USERS_PAGE]
        }
    ],
    [UserProfile.Operator]: [
        {
            title: "Operação",
            pages: [CLIENTS_PAGE]
        }
    ],
}