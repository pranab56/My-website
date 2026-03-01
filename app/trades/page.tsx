import { Suspense } from 'react';
import Trades from '../../components/trades/Trades';

export default function page() {
  return <Suspense fallback={null}><Trades /></Suspense>;
}