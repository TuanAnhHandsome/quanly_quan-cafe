export type Department = { id: string; name: string; };
export type Position   = { id: string; name: string; };

export type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  departmentId: string;
  positionId: string;
  gender: string;
  birthDate: string;
  address: string;
  startDate: string;
  status: 'active' | 'inactive';
  avatar: string;
};

export type EmployeeForm = Omit<Employee, 'id'>;

export const INIT_FORM: EmployeeForm = {
  name: '', phone: '', email: '',
  departmentId: '', positionId: '',
  gender: 'male', birthDate: '', address: '',
  startDate: new Date().toISOString().slice(0, 10),
  status: 'active', avatar: '',
};

export const genEmpId = (list: Employee[]) => {
  const max = list.reduce((m, e) => Math.max(m, parseInt(e.id.replace('NV', ''), 10)), 0);
  return `NV${String(max + 1).padStart(4, '0')}`;
};

export const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();

export const avatarColor = (id: string) => {
  const colors = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4','#84cc16'];
  return colors[parseInt(id.replace('NV',''), 10) % colors.length];
};