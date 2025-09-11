namespace Domain
{
    public class Client : BaseEntity
    {
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string PhoneNumber { get; private set; }
        public string Email { get; private set; }
        public string DocumentNumber { get; private set; }
        public Address Address { get; set; }

        public Client() { }

        public Client(string firstName, string lastName, string phoneNumber, string email, string documentNumber, Address address)
        {
            FirstName = firstName;
            LastName = lastName;
            PhoneNumber = phoneNumber;
            Email = email;
            DocumentNumber = documentNumber;
            Address = address;
        }

        public void UpdateInfo(string firstName, string lastName, string phoneNumber, string email, string documentNumber)
        {
            FirstName = firstName;
            LastName = lastName;
            PhoneNumber = phoneNumber;
            Email = email;
            DocumentNumber = documentNumber;
        }

        public void UpdateAddress(Address address)
        {
            Address = address;
        }
    }
}
