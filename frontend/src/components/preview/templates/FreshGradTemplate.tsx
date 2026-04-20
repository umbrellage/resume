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
    <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '6px' }}>
      {parts.join('  |  ')}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        borderBottom: `2px solid ${colors.accent}`,
        paddingBottom: '4px',
        marginBottom: '10px',
      }}
    >
      <span
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: colors.heading,
          fontFamily: fonts.heading,
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
        <div key={item.id} style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px', color: colors.text }}>
              {item.school}
            </span>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              {formatDate(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '3px' }}>
            {item.college ? `${item.college}  |  ` : ''}
            {[item.degree, item.major].filter(Boolean).join(' - ')}
          </div>
          {item.gpa && (
            <div style={{ fontSize: '13px', color: colors.accent, marginTop: '3px', fontWeight: '600' }}>
              GPA: {item.gpa}
            </div>
          )}
          {item.highlights && item.highlights.filter(Boolean).length > 0 && (
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', lineHeight: '1.5' }}>
              {item.highlights.filter(Boolean).map((h, i) => (
                <li key={i} style={{ fontSize: '12px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(h) }} />
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
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: colors.text }}>
                {item.name || '项目名称'}
              </span>
              <span style={{ fontSize: '12px', color: colors.textLight, flexShrink: 0 }}>
                {formatDate(item.startDate, item.endDate)}
              </span>
            </div>
            {(item.role || item.url) && (
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '1px' }}>
                {item.role}
                {item.role && item.url ? ' · ' : ''}
                {item.url && <span style={{ color: colors.textLight }}>{item.url}</span>}
              </div>
            )}
            {techs.length > 0 && (
              <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '3px' }}>
                {techs.map((t, i) => (
                  <span key={i} style={{ display: 'inline-block', padding: '1px 8px', margin: '1px 2px', borderRadius: '12px', background: '#f0f4f8', color: colors.accent, fontSize: '11px', lineHeight: '19px' }}>{t}</span>
                ))}
              </div>
            )}
            {descs.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                {descs.map((d, i) => (
                  <div key={i} style={{ fontSize: '12px', color: colors.textSecondary, lineHeight: '1.5', paddingLeft: '14px', position: 'relative', marginBottom: '1px' }}>
                    <span style={{ position: 'absolute', left: '0', top: '7px', width: '4px', height: '4px', borderRadius: '50%', background: colors.textSecondary }} />
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

function ExperienceSection({ items }: { items: ResumeSection & { type: 'experience' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="工作经验" />
      {items.items.map((item) => (
        <div key={item.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: colors.text }}>
              {item.company}
            </span>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              {formatDate(item.startDate, item.endDate)}
              {item.location ? `  |  ${item.location}` : ''}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '2px' }}>
            {item.position}
          </div>
          {item.description && item.description.filter(Boolean).length > 0 && (
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', lineHeight: '1.5' }}>
              {item.description.filter(Boolean).map((d, i) => (
                <li key={i} style={{ fontSize: '12px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function SkillSection({ items }: { items: ResumeSection & { type: 'skill' } }) {
  if (!items.items || items.items.length === 0) return null;
  return (
    <div>
      <SectionTitle title="专业技能" />
      {items.items.map((item) => (
        <div key={item.id} style={{ marginBottom: '6px', fontSize: '13px', lineHeight: '1.5' }}>
          {item.category && (
            <span style={{ fontWeight: 'bold', color: colors.text }}>{item.category}: </span>
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
          <span style={{ fontSize: '13px', color: colors.text }}>
            {item.name}
            {item.issuer ? ` - ${item.issuer}` : ''}
          </span>
          {item.date && (
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              {item.date.replace(/-/g, '.')}
            </span>
          )}
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
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: colors.text }}>
                {item.title || '标题'}
              </span>
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                {item.startDate ? item.startDate.replace(/-/g, '.') : ''}{item.startDate && item.endDate ? ' - ' : ''}{item.endDate ? item.endDate.replace(/-/g, '.') : ''}
              </span>
            </div>
            {item.subtitle && (
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>
                {item.subtitle}
              </div>
            )}
            {descs.length > 0 && (
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', lineHeight: '1.6' }}>
                {descs.map((d, i) => (
                  <li key={i} style={{ fontSize: '12px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FreshGradTemplate({ data, onePageScale, pageMargin = 42 }: TemplateProps) {
  const { personalInfo: p } = data;

  // Reorder sections: Education first, then Projects, then Experience, then Skills, then Certifications
  const reorderedSections: ResumeSection[] = [];
  const eduSection = data.sections.find((s) => s.type === 'education');
  if (eduSection) reorderedSections.push(eduSection);

  const projSection = data.sections.find((s) => s.type === 'project');
  if (projSection) reorderedSections.push(projSection);

  const expSection = data.sections.find((s) => s.type === 'experience');
  if (expSection) reorderedSections.push(expSection);

  const skillSection = data.sections.find((s) => s.type === 'skill');
  if (skillSection) reorderedSections.push(skillSection);

  const certSection = data.sections.find((s) => s.type === 'certification');
  if (certSection) reorderedSections.push(certSection);

  // Add any custom sections
  data.sections
    .filter((s) => s.type === 'custom')
    .forEach((s) => reorderedSections.push(s));

  const isScaled = onePageScale !== null;

  return (
    <div
      style={{
        width: '794px',
        height: isScaled ? '1123px' : undefined,
        minHeight: isScaled ? undefined : '1123px',
        background: colors.background,
        fontFamily: fonts.body,
        color: colors.text,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: isScaled
            ? `${pageMargin / onePageScale}px ${pageMargin * 1.24 / onePageScale}px`
            : `${pageMargin}px ${pageMargin * 1.24}px`,
          transform: isScaled ? `scale(${onePageScale})` : undefined,
          transformOrigin: 'top left',
          width: isScaled ? `${794 / onePageScale}px` : '100%',
        }}
      >
      {/* Header */}
      <div data-preview-section="personal" style={{ paddingTop: '30px', textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: colors.heading, fontFamily: fonts.heading }}>
          {p.name || '你的姓名'}
        </h1>
        {p.title && (
          <div style={{ fontSize: '15px', color: colors.textSecondary, marginTop: '4px' }}>{p.title}</div>
        )}
        <ContactLine data={data} />
      </div>

      {/* Summary */}
      {p.summary && (
        <div style={{ fontSize: '12px', lineHeight: '1.6', color: colors.textSecondary, marginBottom: '14px', textAlign: 'justify' }}>
          {p.summary}
        </div>
      )}

      {/* Sections - reordered for fresh grad */}
      {reorderedSections.map((section, index) => {
        const key = section.type === 'custom' ? `custom-${index}` : section.type;
        return (
          <div key={key} style={{ marginBottom: '16px' }}>
            {section.type === 'education' && (
              <EducationSection items={section as ResumeSection & { type: 'education' }} />
            )}
            {section.type === 'project' && (
              <ProjectSection items={section as ResumeSection & { type: 'project' }} />
            )}
            {section.type === 'experience' && (
              <ExperienceSection items={section as ResumeSection & { type: 'experience' }} />
            )}
            {section.type === 'skill' && (
              <SkillSection items={section as ResumeSection & { type: 'skill' }} />
            )}
            {section.type === 'certification' && (
              <CertificationSection items={section as ResumeSection & { type: 'certification' }} />
            )}
            {section.type === 'custom' && (
              <CustomSection section={section as ResumeSection & { type: 'custom' }} />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
