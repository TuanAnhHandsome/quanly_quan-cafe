import React, { useState } from 'react';
import employeesData from '../../employees.json';
import type { Employee, Department, Position, EmployeeForm } from './employeeTypes';
import { genEmpId } from './employeeTypes';
import EmployeeList from './EmployeeList';

const Employees: React.FC = () => {
  const [employees,   setEmployees]   = useState<Employee[]>(employeesData.employees as Employee[]);
  const [departments, setDepartments] = useState<Department[]>(employeesData.departments);
  const [positions,   setPositions]   = useState<Position[]>(employeesData.positions);

  /* ── Employee handlers ── */
  const handleAdd = (form: EmployeeForm) => {
    setEmployees(prev => [{ id: genEmpId(prev), ...form }, ...prev]);
  };

  const handleUpdate = (id: string, form: EmployeeForm) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...form } : e));
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleToggle = (id: string) => {
    setEmployees(prev => prev.map(e =>
      e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
    ));
  };

  /* ── Department handlers ── */
  const handleDeptAdd = (name: string) => {
    setDepartments(prev => [...prev, { id: `dept-${Date.now()}`, name }]);
  };

  const handleDeptUpdate = (id: string, name: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const handleDeptDelete = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  /* ── Position handlers ── */
  const handlePosAdd = (name: string) => {
    setPositions(prev => [...prev, { id: `pos-${Date.now()}`, name }]);
  };

  const handlePosUpdate = (id: string, name: string) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const handlePosDelete = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <EmployeeList
      employees={employees}
      departments={departments}
      positions={positions}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onToggle={handleToggle}
      onDeptAdd={handleDeptAdd}
      onDeptUpdate={handleDeptUpdate}
      onDeptDelete={handleDeptDelete}
      onPosAdd={handlePosAdd}
      onPosUpdate={handlePosUpdate}
      onPosDelete={handlePosDelete}
    />
  );
};

export default Employees;