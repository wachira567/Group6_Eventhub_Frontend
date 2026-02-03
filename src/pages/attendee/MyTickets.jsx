import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Ticket, Calendar, MapPin, Clock, Download, Eye, ChevronLeft, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import { API_BASE_URL } from '../../utils/constants';
