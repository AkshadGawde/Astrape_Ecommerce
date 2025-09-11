import { useState } from "react";
import Image from 'next/image';

interface CartItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  onUpdate: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const CartItem = ({ id, name, image, price, quantity, stock, onUpdate, onRemove }: CartItemProps) => {
  const [localQty, setLocalQty] = useState(quantity);
  const [loading, setLoading] = useState(false);
  const unitPrice = typeof price === 'number' && !isNaN(price) ? price : 0;

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || newQty > stock) return;
    setLoading(true);
    await onUpdate(id, newQty);
    setLocalQty(newQty);
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(id);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 border-b py-4">
      <div className="relative w-20 h-20">
        <Image src={image || '/placeholder.png'} alt={name} fill className="object-cover rounded" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-gray-600">${unitPrice.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button className="btn" disabled={loading || localQty <= 1} onClick={() => handleQtyChange(localQty - 1)}>-</button>
          <input
            type="number"
            value={localQty}
            min={1}
            max={stock}
            onChange={(e) => handleQtyChange(Number(e.target.value))}
            className="input w-16 text-center"
            disabled={loading}
          />
          <button className="btn" disabled={loading || localQty >= stock} onClick={() => handleQtyChange(localQty + 1)}>+</button>
        </div>
        <button className="btn bg-red-500 text-white mt-2" disabled={loading} onClick={handleRemove}>Remove</button>
      </div>
  <div className="font-bold text-lg">Subtotal: ${(unitPrice * localQty).toFixed(2)}</div>
    </div>
  );
};

export default CartItem;
