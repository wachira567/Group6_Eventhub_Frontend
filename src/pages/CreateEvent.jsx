import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Ticket,
  Plus,
  X,
  ChevronLeft,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { CATEGORIES } from '../utils/constants';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    image: null,
    ticketTypes: [
      { name: 'Regular', price: '', quantity: '' },
    ],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTicketChange = (index, field, value) => {
    const newTicketTypes = [...formData.ticketTypes];
    newTicketTypes[index][field] = value;
    setFormData({ ...formData, ticketTypes: newTicketTypes });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [...formData.ticketTypes, { name: '', price: '', quantity: '' }],
    });
  };

  const removeTicketType = (index) => {
    const newTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
    setFormData({ ...formData, ticketTypes: newTicketTypes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate event creation
    alert('Event created successfully!');
    navigate('/dashboard/events');
  };

  const steps = [
    { number: 1, title: 'Event Details' },
    { number: 2, title: 'Date & Location' },
    { number: 3, title: 'Tickets' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {/* Header */}
