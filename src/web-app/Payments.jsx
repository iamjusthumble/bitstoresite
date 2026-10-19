import React, { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../ui.js';
import { FieldError, Modal, NoticeDialog, cancelBtn, dangerBtn, field, fieldBorder, pillTab, primaryBtn } from './flow.jsx';
import { ChevronUpDown, Edit, MoreVertical, Plus, Trash } from './icons.jsx';
import { ACCOUNT_TYPES, PROVIDERS, ProviderLogo, TypeTag, providerById, typeById, usePaymentAccounts } from './paymentAccounts.jsx';
import { card, cardTitle } from './parts.jsx';

// Saved payout and payment accounts (Figma 377:87669 and its states). #payments/add opens straight on the add form.

const FILTERS = [['all', 'All'], ['sell', 'Sell'], ['buy', 'Buy'], ['both', 'Buy/Sell']];

// Ghana mobile money numbers: ten digits starting with 0
const NUMBER_PATTERN = /^0\d{9}$/;

const label = 'text-sm font-medium leading-5 text-wa-muted';
const fieldBox = 'flex h-[60px] w-full items-center gap-2 px-3.5 text-left text-sm font-medium leading-[22px] text-wa-text';

function TypeIcon({ id, size = 40, className }) {
  const type = typeById[id];
  const inner = size >= 40 ? 24 : 12;
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full', type.tint, className)} style={{ width: size, height: size }}>
      <img src={type.icon} alt="" width={inner} height={inner} />
    </span>
  );
}

// Closes a popover when the pointer lands outside it or Escape is pressed
function useDismiss(open, ref, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => !ref.current?.contains(e.target) && onClose();
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // Inside a dialog, Escape closes the list first and leaves the dialog open
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, ref, onClose]);
}

// A field that opens a short list of options, each with an icon (the providers and the account types)
function Select({ id, options, value, onChange, placeholder, renderIcon, error }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const listId = useId();
  const selected = options.find((o) => o.id === value);

  const close = (refocus) => {
    setOpen(false);
    if (refocus) ref.current?.querySelector('button')?.focus();
  };
  useDismiss(open, ref, close);

  useEffect(() => {
    if (open) ref.current.querySelector('[role="listbox"]').focus();
  }, [open]);

  const pick = (option) => {
    onChange(option.id);
    close(true);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(options[active]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative mt-2">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={() => {
          setActive(Math.max(options.findIndex((o) => o.id === value), 0));
          setOpen((o) => !o);
        }}
        className={cx(field, fieldBox, open ? 'border-tab-active' : error ? 'border-down' : 'border-wa-line hover:border-tab-active focus-visible:border-tab-active')}
      >
        {selected ? (
          <>
            {renderIcon(selected.id)}
            <span className="min-w-0 flex-1 truncate">{selected.name}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 text-[13px] font-normal text-wa-muted">{placeholder}</span>
        )}
        <ChevronUpDown size={18} className="shrink-0 text-wa-muted" />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          aria-activedescendant={`${listId}-${options[active].id}`}
          onKeyDown={onKey}
          className="absolute inset-x-0 top-[calc(100%+4px)] z-20 grid animate-[pop-in_0.15s_ease-out] gap-1 rounded-2xl border border-wa-line bg-wa-inset p-1.5 shadow-(--wa-shadow) outline-none"
        >
          {options.map((o, i) => (
            <li
              key={o.id}
              id={`${listId}-${o.id}`}
              role="option"
              aria-selected={o.id === value}
              data-active={i === active || undefined}
              onPointerMove={() => setActive(i)}
              onClick={() => pick(o)}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium leading-[22px] text-wa-text data-active:bg-wa-pill"
            >
              {renderIcon(o.id)}
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Add and edit share one form; `account` is set when editing
function AccountForm({ account, accounts, onSave, onClose }) {
  const editing = Boolean(account);
  const [provider, setProvider] = useState(account?.provider || null);
  const [number, setNumber] = useState(account?.number || '');
  const [holder, setHolder] = useState(account?.holder || '');
  const [type, setType] = useState(account?.type || null);
  const [attempted, setAttempted] = useState(false);

  const numberOk = NUMBER_PATTERN.test(number);
  const duplicate = numberOk && provider && accounts.some((a) => a.id !== account?.id && a.provider === provider && a.number === number);
  const errors = {
    provider: provider ? '' : 'Choose the mobile money provider.',
    number: !number ? 'Enter the account number.' : !numberOk ? 'Enter the 10-digit number, starting with 0.' : duplicate ? 'This account is already saved.' : '',
    holder: holder.trim().length > 1 ? '' : 'Enter the name on the account.',
    type: type ? '' : 'Choose what this account is for.',
  };
  const show = (key) => attempted && errors[key];

  const submit = (e) => {
    e.preventDefault();
    setAttempted(true);
    const firstError = Object.keys(errors).find((key) => errors[key]);
    if (firstError) {
      document.getElementById(`wa-pm-${firstError}`)?.focus();
      return;
    }
    onSave({ id: account?.id || `pm-${Date.now()}`, provider, number, holder: holder.trim(), type });
  };

  return (
    <Modal labelledBy="wa-pm-form" onClose={onClose} className="max-w-[550px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-pm-form" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">{editing ? 'Edit Payment Method' : 'Add Payment Method'}</h3>

        <div className="mt-5 grid gap-5">
          <div>
            <span className={label} id="wa-pm-provider-label">Provider</span>
            <Select
              id="wa-pm-provider"
              options={PROVIDERS}
              value={provider}
              onChange={setProvider}
              placeholder="Select provider"
              renderIcon={(id) => <ProviderLogo id={id} size={18} />}
              error={show('provider')}
            />
            <FieldError>{show('provider')}</FieldError>
          </div>

          <div>
            <label htmlFor="wa-pm-number" className={label}>Account Number</label>
            <div className={cx(field, fieldBorder(show('number')), 'mt-2 flex h-[60px] items-center px-3.5')}>
              <input
                id="wa-pm-number"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="0000000000"
                aria-invalid={Boolean(show('number'))}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium leading-[22px] text-wa-text tabular-nums outline-none placeholder:font-normal placeholder:text-wa-muted"
              />
            </div>
            <FieldError>{show('number')}</FieldError>
          </div>

          {/* The name is asked for once the number is complete, as in the Figma */}
          {(numberOk || editing || holder) && (
            <div>
              <label htmlFor="wa-pm-holder" className={label}>Account Name</label>
              <div className={cx('mt-2 flex h-[60px] items-center rounded-2xl border border-dashed bg-tab-active/5 px-3.5 transition-colors duration-150 dark:bg-tab-active/25', show('holder') ? 'border-down' : 'border-wa-muted/50 focus-within:border-tab-active')}>
                <input
                  id="wa-pm-holder"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  autoComplete="name"
                  maxLength={60}
                  placeholder="Name registered on the account"
                  aria-invalid={Boolean(show('holder'))}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium leading-[22px] text-wa-text outline-none placeholder:font-normal placeholder:text-wa-muted"
                />
              </div>
              <FieldError>{show('holder')}</FieldError>
            </div>
          )}

          <div>
            <span className={label}>Account Type</span>
            <Select
              id="wa-pm-type"
              options={ACCOUNT_TYPES}
              value={type}
              onChange={setType}
              placeholder="Select account type"
              renderIcon={(id) => <TypeIcon id={id} size={20} className="-scale-x-100" />}
              error={show('type')}
            />
            <FieldError>{show('type')}</FieldError>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3.5 max-sm:mt-8">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>{editing ? 'Save Changes' : 'Add Payment Method'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ account, onConfirm, onClose }) {
  return (
    <NoticeDialog
      id="wa-pm-delete"
      icon={Trash}
      title="Delete Payment Method"
      onClose={onClose}
      actions={[
        <button key="cancel" type="button" onClick={onClose} className={cancelBtn}>Cancel</button>,
        <button key="delete" type="button" onClick={onConfirm} autoFocus className={dangerBtn}>Yes, Delete</button>,
      ]}
    >
      <p>Are you sure you want to delete this payment method? This action is irreversible</p>
      <p className="mt-3 text-sm font-semibold text-wa-text">{providerById[account.provider].name} · {account.number}</p>
    </NoticeDialog>
  );
}

// Edit and Delete for one row, opened from its ⋮ button
function RowMenu({ account, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = (refocus) => {
    setOpen(false);
    if (refocus) ref.current?.querySelector('button')?.focus();
  };
  useDismiss(open, ref, close);

  const item = 'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium leading-4 text-wa-text hover:bg-wa-pill';
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Options for ${providerById[account.provider].name} ${account.number}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-11 place-items-center rounded-full text-wa-text transition-colors duration-150 hover:bg-wa-pill aria-expanded:bg-wa-pill"
      >
        <MoreVertical size={24} />
      </button>
      {open && (
        <div role="menu" className="absolute right-2 top-[calc(100%-6px)] z-20 w-[120px] animate-[pop-in_0.15s_ease-out] rounded-lg border border-wa-line bg-wa-inset p-1 shadow-(--wa-shadow)">
          <button type="button" role="menuitem" autoFocus className={item} onClick={() => { setOpen(false); onEdit(); }}>
            <Edit size={16} />
            Edit
          </button>
          <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onDelete(); }}>
            <Trash size={16} className="text-down" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function Cell({ heading, className, children }) {
  return (
    <div className={cx('min-w-0', className)}>
      <span className="block text-xs font-medium leading-4 text-wa-muted">{heading}</span>
      <span className="mt-1 flex h-8 min-w-0 items-center gap-1.5 text-sm leading-none text-wa-text">{children}</span>
    </div>
  );
}

function AccountRow({ account, onEdit, onDelete }) {
  const provider = providerById[account.provider];
  return (
    <li className="flex items-center gap-1.5 rounded-[20px] border border-wa-line py-2.5 pl-4 pr-2.5 @max-lg:flex-wrap @max-lg:pl-3.5">
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2.5 @max-lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @max-lg:gap-y-1">
        <Cell heading="Account Type">
          <ProviderLogo id={provider.id} />
          <span className="truncate">{provider.short}</span>
        </Cell>
        <Cell heading="Account Name" className="@max-lg:order-last @max-lg:col-span-2">
          <span className="truncate font-medium">{account.holder}</span>
        </Cell>
        <Cell heading="Account Number">
          <span className="truncate font-medium tabular-nums">{account.number}</span>
        </Cell>
      </div>
      <div className="flex w-[88px] shrink-0 justify-center @max-lg:w-auto">
        <TypeTag id={account.type} />
      </div>
      <RowMenu account={account} onEdit={onEdit} onDelete={onDelete} />
    </li>
  );
}

function Summary({ accounts }) {
  return (
    <section className={cx(card, 'self-start lg:min-h-[339px]')} aria-labelledby="wa-pm-summary">
      <h2 id="wa-pm-summary" className={cx(cardTitle, 'leading-8')}>Summary</h2>
      <ul className="mt-6 grid gap-4 max-lg:grid-cols-3 max-sm:grid-cols-1">
        {ACCOUNT_TYPES.map((t) => (
          <li key={t.id} className="flex items-center gap-4">
            <TypeIcon id={t.id} />
            <span className="min-w-0">
              <span className="block truncate text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text max-md:text-base max-md:leading-6">{t.summary}</span>
              <span className="block text-sm font-semibold leading-6 tracking-[-0.14px] text-wa-muted tabular-nums">{accounts.filter((a) => a.type === t.id).length}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Payments({ adding }) {
  const [accounts, setAccounts] = usePaymentAccounts();
  const [filter, setFilter] = useState('all');
  // null, { mode: 'add' }, { mode: 'edit', account } or { mode: 'delete', account }
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');

  const shown = filter === 'all' ? accounts : accounts.filter((a) => a.type === filter);

  // Reached from "Add new account" in a money flow
  useEffect(() => {
    if (adding) setDialog({ mode: 'add' });
  }, [adding]);

  const closeDialog = () => {
    setDialog(null);
    if (adding) window.location.hash = 'payments';
  };

  const save = (saved) => {
    const exists = accounts.some((a) => a.id === saved.id);
    setAccounts((list) => (exists ? list.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...list]));
    // Keep the account in view if the current filter would hide it
    if (filter !== 'all' && filter !== saved.type) setFilter('all');
    setNotice(`${providerById[saved.provider].name} account ${exists ? 'updated' : 'added'}.`);
    closeDialog();
  };

  const remove = (account) => {
    setAccounts((list) => list.filter((a) => a.id !== account.id));
    setNotice(`${providerById[account.provider].name} account deleted.`);
    closeDialog();
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,389px)]">
      <div className="grid min-w-0 gap-5 max-lg:order-last">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Show accounts" className="flex flex-wrap">
            {FILTERS.map(([id, name]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={pillTab}>
                {name}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setDialog({ mode: 'add' })} className="inline-flex h-12 items-center justify-center gap-1 rounded-full bg-tab-active px-6 text-[15px] font-bold leading-6 tracking-[-0.15px] text-white transition-colors duration-150 hover:bg-brand-strong max-sm:w-full">
            <Plus size={24} />
            Add Payment Method
          </button>
        </div>

        <section className={cx(card, '@container px-5 max-sm:px-3')} aria-label="Saved payment methods">
          {shown.length ? (
            <ul className="grid gap-4">
              {shown.map((a) => (
                <AccountRow key={a.id} account={a} onEdit={() => setDialog({ mode: 'edit', account: a })} onDelete={() => setDialog({ mode: 'delete', account: a })} />
              ))}
            </ul>
          ) : (
            <div className="grid place-items-center px-4 py-14 text-center">
              <h3 className="text-lg font-semibold leading-7 text-wa-text">
                {filter === 'all' ? 'No payment methods yet' : `No ${typeById[filter].name.toLowerCase().replace('/ ', '/')}s yet`}
              </h3>
              <p className="mt-1 max-w-[340px] text-sm leading-5 text-wa-muted">Add a mobile money account to pay for crypto or receive money when you sell.</p>
              <button type="button" onClick={() => setDialog({ mode: 'add' })} className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-wa-pill px-5 text-[15px] font-bold leading-6 text-wa-text hover:bg-wa-pill-hover">
                <Plus size={18} />
                Add Payment Method
              </button>
            </div>
          )}
        </section>
        <p className="sr-only" role="status">{notice}</p>
      </div>

      <Summary accounts={accounts} />

      {(dialog?.mode === 'add' || dialog?.mode === 'edit') && <AccountForm account={dialog.account} accounts={accounts} onSave={save} onClose={closeDialog} />}
      {dialog?.mode === 'delete' && <DeleteDialog account={dialog.account} onConfirm={() => remove(dialog.account)} onClose={closeDialog} />}
    </div>
  );
}
