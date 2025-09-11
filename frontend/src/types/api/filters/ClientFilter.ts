import {BaseFilter} from "@/types/api/filters/BaseFilter";

export interface ClientFilter extends BaseFilter {
  document?: string;
}
