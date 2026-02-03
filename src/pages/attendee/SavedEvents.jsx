import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, Calendar, MapPin, ChevronLeft, Search, X, Ticket, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
