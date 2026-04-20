import { useResumeStore } from '../../store/useResumeStore';
import Input from '../common/Input';
import ItemToolbar from './ItemToolbar';

interface CertificationFormProps {
  sectionIndex: number;
  itemIndex: number;
}

export default function CertificationForm({ sectionIndex, itemIndex }: CertificationFormProps) {
  const resume = useResumeStore((s) => s.resume);
  const updateItem = useResumeStore((s) => s.updateItem);

  const section = resume?.sections[sectionIndex];
  if (!section || !('items' in section)) return null;
  const item = section.items[itemIndex] as {
    name: string;
    issuer: string;
    date: string;
    url: string;
  };
  if (!item) return null;

  return (
    <div className="space-y-3">
      <ItemToolbar sectionIndex={sectionIndex} itemIndex={itemIndex} totalItems={section.items.length} />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="证书名称"
          value={item.name}
          onChange={(e) => updateItem(sectionIndex, itemIndex, 'name', e.target.value)}
          placeholder="AWS Solutions Architect"
        />
        <Input
          label="颁发机构"
          value={item.issuer}
          onChange={(e) => updateItem(sectionIndex, itemIndex, 'issuer', e.target.value)}
          placeholder="Amazon Web Services"
        />
        <Input
          label="获得时间"
          type="month"
          value={item.date}
          onChange={(e) => updateItem(sectionIndex, itemIndex, 'date', e.target.value)}
        />
        <Input
          label="证书链接"
          value={item.url}
          onChange={(e) => updateItem(sectionIndex, itemIndex, 'url', e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>
    </div>
  );
}
