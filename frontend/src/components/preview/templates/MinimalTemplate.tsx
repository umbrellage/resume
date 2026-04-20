import type { ResumeData, ResumeSection } from '../../../types/resume';
import type { TemplateProps } from './index';
import { fonts, colors } from './templateStyles';
import { addInlineListStyles } from '../../../utils/listStyles';
import { calculateAge } from '../../../utils/date';


function formatDate(start: string, end: string): string {
  const s = start.replace(/-/g, '.');
  const e = end.replace(/-/g, '.');
  if (!s && !e) return '';
  if (!e) return `${s} - 至今`;
  return `${s} - ${e}`;
}

function ContactLine({ data }: { data: ResumeData }) {
  const { personalInfo: p } = data;
  const parts: string[] = [];
  if (p.phone) parts.push(p.phone);
  if (p.email) parts.push(p.email);
  if (p.location) parts.push(p.location);
  const age = calculateAge(p.birthDate);
  if (age) parts.push(`${age}岁`);
  if (p.gender) parts.push(p.gender);
  if (p.website) parts.push(p.website);
  if (parts.length === 0) return null;
  return (
    <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '8px', letterSpacing: '0.3px' }}>
      {parts.join('  |  ')}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <span
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.heading,
          fontFamily: fonts.heading,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </span>
    </div>
  );
}

function EducationSection({ items }: { items: ResumeSection & { type: 'education' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="教育经历" />
      {items.items.map((item) => (
        <div key={item.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: '600', fontSize: '13px', color: colors.text }}>
              {item.school}
            </span>
            <span style={{ fontSize: '11px', color: colors.textLight }}>
              {formatDate(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>
            {[item.degree, item.major].filter(Boolean).join(' - ')}
            {item.gpa ? `  |  GPA: ${item.gpa}` : ''}
          </div>
          {item.highlights && item.highlights.filter(Boolean).length > 0 && (
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', lineHeight: '1.6' }}>
              {item.highlights.filter(Boolean).map((h, i) => (
                <li key={i} style={{ fontSize: '11px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(h) }} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceSection({ items }: { items: ResumeSection & { type: 'experience' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="工作经验" />
      {items.items.map((item) => (
        <div key={item.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: '600', fontSize: '13px', color: colors.text }}>
              {item.company}
            </span>
            <span style={{ fontSize: '11px', color: colors.textLight }}>
              {formatDate(item.startDate, item.endDate)}
              {item.location ? `  |  ${item.location}` : ''}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>
            {item.position}
          </div>
          {item.description && item.description.filter(Boolean).length > 0 && (
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', lineHeight: '1.6' }}>
              {item.description.filter(Boolean).map((d, i) => (
                <li key={i} style={{ fontSize: '11px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectSection({ items }: { items: ResumeSection & { type: 'project' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="项目经历" />
      {items.items.map((item) => {
        const descs = item.description?.filter(Boolean) || [];
        const techs = item.technologies?.filter(Boolean) || [];
        return (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: '600', fontSize: '13px', color: colors.text }}>
                {item.name || '项目名称'}
              </span>
              <span style={{ fontSize: '11px', color: colors.textLight, flexShrink: 0 }}>
                {formatDate(item.startDate, item.endDate)}
              </span>
            </div>
            {(item.role || item.url) && (
              <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '1px' }}>
                {item.role}
                {item.role && item.url ? ' · ' : ''}
                {item.url && <span style={{ color: colors.textLight }}>{item.url}</span>}
              </div>
            )}
            {techs.length > 0 && (
              <div style={{ fontSize: '10px', color: colors.textLight, marginTop: '3px' }}>
                {techs.join(' · ')}
              </div>
            )}
            {descs.length > 0 && (
              <div style={{ marginTop: '3px' }}>
                {descs.map((d, i) => (
                  <div key={i} style={{
                    fontSize: '11px', color: colors.textSecondary, lineHeight: '1.6',
                    paddingLeft: '12px', position: 'relative', marginBottom: '1px',
                  }}>
                    <span style={{ position: 'absolute', left: '0', top: '7px', width: '3px', height: '3px', borderRadius: '50%', background: colors.textLight }} />
                    <span dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkillSection({ items }: { items: ResumeSection & { type: 'skill' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="专业技能" />
      {items.items.map((item) => (
        <div key={item.id} style={{ marginBottom: '6px', fontSize: '12px', lineHeight: '1.6' }}>
          {item.category && (
            <span style={{ fontWeight: '600', color: colors.text }}>{item.category}: </span>
          )}
          <span style={{ color: colors.textSecondary }}>{item.skills}</span>
        </div>
      ))}
    </div>
  );
}

function CertificationSection({ items }: { items: ResumeSection & { type: 'certification' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="证书认证" />
      {items.items.map((item) => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: colors.text }}>
            {item.name}
            {item.issuer ? ` - ${item.issuer}` : ''}
          </span>
          {item.date && (
            <span style={{ fontSize: '11px', color: colors.textLight }}>
              {item.date.replace(/-/g, '.')}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function SummarySection({ items }: { items: ResumeSection & { type: 'summary' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="自我评价" />
      {items.items.map((item) => (
        <div key={item.id} style={{ fontSize: '13px', lineHeight: '1.8', color: colors.text, textAlign: 'justify', marginBottom: '6px' }}>
          {item.content}
        </div>
      ))}
    </div>
  );
}

function CustomSection({ section }: { section: ResumeSection & { type: 'custom' } }) {
  if (!section.items || section.items.length === 0) return null;
  const title = section.title || '自定义';
  return (
    <div>
      <SectionTitle title={title} />
      {section.items.map((item) => {
        const descs = item.description?.filter(Boolean) || [];
        return (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: colors.text }}>
                {item.title || '标题'}
              </span>
              <span style={{ fontSize: '11px', color: colors.textSecondary }}>
                {formatDate(item.startDate, item.endDate)}
              </span>
            </div>
            {item.subtitle && (
              <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '2px' }}>
                {item.subtitle}
              </div>
            )}
            {descs.length > 0 && (
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', lineHeight: '1.6' }}>
                {descs.map((d, i) => (
                  <li key={i} style={{ fontSize: '11px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionRenderer({ section }: { section: ResumeSection }) {
  switch (section.type) {
    case 'education':
      return <EducationSection items={section as ResumeSection & { type: 'education' }} />;
    case 'experience':
      return <ExperienceSection items={section as ResumeSection & { type: 'experience' }} />;
    case 'project':
      return <ProjectSection items={section as ResumeSection & { type: 'project' }} />;
    case 'skill':
      return <SkillSection items={section as ResumeSection & { type: 'skill' }} />;
    case 'certification':
      return <CertificationSection items={section as ResumeSection & { type: 'certification' }} />;
    case 'summary':
      return <SummarySection items={section as ResumeSection & { type: 'summary' }} />;
    case 'custom':
      return <CustomSection section={section as ResumeSection & { type: 'custom' }} />;
    default:
      return null;
  }
}

export default function MinimalTemplate({ data, onePageScale }: TemplateProps) {
  const { personalInfo: p } = data;
  const s = onePageScale ?? 1;
  const isScaled = onePageScale !== null;
  return (
    <div
      style={{
        width: '794px',
        height: isScaled ? '1123px' : 'minHeight: 1123px',
        background: colors.background,
        padding: '50px 60px',
        fontFamily: fonts.body,
        color: colors.text,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div data-preview-section="personal" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '300', margin: 0, color: colors.heading, fontFamily: fonts.heading, letterSpacing: '2px' }}>
          {p.name || '你的姓名'}
        </h1>
        {p.title && (
          <div style={{ fontSize: '13px', color: colors.textLight, marginTop: '6px' }}>{p.title}</div>
        )}
        <ContactLine data={data} />
      </div>

      {/* Summary */}
      {p.summary && (
        <div style={{ fontSize: '11px', lineHeight: '1.7', color: colors.textSecondary, marginBottom: '20px', textAlign: 'center', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          {p.summary}
        </div>
      )}

      {/* Sections */}
      {data.sections.map((section, index) => (
        <div key={section.type === 'custom' ? `custom-${index}` : section.type} data-preview-section={`${section.type}-${index}`} style={{ marginBottom: '18px' }}>
          <SectionRenderer section={section} />
        </div>
      ))}
    </div>
  );
}
