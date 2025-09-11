import moment from "moment";

export const formatDateForAPI = (date: Date | string): string => {
  if (!date) return "";

  if (typeof date === 'string') {
    const parsedDate = moment(date, "DD/MM/YYYY", true);
    return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : "";
  }

  return moment(date).format("DD/MM/YYYY");
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  return moment(dateString).format("DD/MM/YYYY");
};

export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = moment(dateString, "DD/MM/YYYY", true);
  return date.isValid() ? date.toDate() : null;
};

export const formatDateForDatePicker = (dateString: string): string => {
  if (!dateString) return "";

  if (dateString.includes('T') || dateString.includes('-')) {
    const momentDate = moment(dateString);

    if (!momentDate.isValid() || momentDate.year() < 1900) {
      return "";
    }

    return momentDate.format("DD/MM/YYYY");
  }

  const momentDate = moment(dateString, "DD/MM/YYYY", true);
  if (!momentDate.isValid() || momentDate.year() < 1900) {
    return "";
  }

  return dateString;
};

export const createDatePickerHandler = (fieldName: string, formikHandleChange: any) => {
  return (event: any) => {
    formikHandleChange(event);
  };
};
