import React, { HTMLAttributes, useCallback } from 'react';
import { Button, Text } from '@deriv/ui';
import { useForm } from 'react-hook-form';
import { Circles } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';
import { scopesObjectToArray } from '@site/src/utils';
import ApiTokenCard from '../ApiTokenCard';
import useCreateToken from '@site/src/features/dashboard/hooks/useCreateToken';
import * as yup from 'yup';
import styles from './api-token.form.module.scss';
import useApiToken from '@site/src/hooks/useApiToken';

const schema = yup
  .object({
    read: yup.boolean(),
    trade: yup.boolean(),
    payments: yup.boolean(),
    trading_information: yup.boolean(),
    admin: yup.boolean(),
    name: yup.string().required(),
  })
  .required();

export type TApiTokenForm = yup.InferType<typeof schema>;
export type TApiTokenFormItemsNames = keyof TApiTokenForm;

type TScope = {
  name: TApiTokenFormItemsNames;
  description: string;
  label: string;
};

const scopes: TScope[] = [
  {
    name: 'read',
    description:
      'This scope will allow third-party apps to view your account activity, settings, limits, balance sheets, trade purchase history, and more.',
    label: 'Read',
  },
  {
    name: 'trade',
    description:
      'This scope will allow third-party apps to buy and sell contracts for you, renew your expired purchases, and top up your demo accounts.',
    label: 'Trade',
  },
  {
    name: 'payments',
    description:
      'This scope will allow third-party apps to withdraw to payment agents and make inter-account transfers for you.',
    label: 'Payments',
  },
  {
    name: 'trading_information',
    description: 'This scope will allow third-party apps to view your trading history.',
    label: 'Trading Information',
  },
  {
    name: 'admin',
    description:
      'This scope will allow third-party apps to open accounts for you, manage your settings and token usage, and more.',
    label: 'Admin',
  },
];

const ApiTokenForm = (props: HTMLAttributes<HTMLFormElement>) => {
  const { createToken, isCreatingToken } = useCreateToken();
  const { tokens } = useApiToken();

  const { handleSubmit, register, setValue, getValues, reset } = useForm<TApiTokenForm>({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const onSubmit = useCallback(
    (data: TApiTokenForm) => {
      const { name } = data;
      const selectedTokenScope = scopesObjectToArray({
        admin: data.admin,
        payments: data.payments,
        read: data.read,
        trade: data.trade,
        trading_information: data.trading_information,
      });
      createToken(name, selectedTokenScope);
      reset();
    },
    [createToken, reset],
  );

  const onCardClick = useCallback(
    (name: TApiTokenFormItemsNames) => {
      const values = getValues();
      setValue(name, !values[name]);
    },
    [getValues, setValue],
  );

  return (
    <form role={'form'} onSubmit={handleSubmit(onSubmit)} {...props}>
      <div className={styles.steps_line} />
      <div>
        <Circles
          height='100'
          width='100'
          color='#d44c0d'
          ariaLabel='circles-loading'
          wrapperClass='loading'
          visible={isCreatingToken}
        />
        <div className={styles.step_title}>
          <div className={`${styles.first_step} ${styles.step}`}>
            <Text as={'p'} type={'paragraph-1'} data-testid={'first-step-title'}>
              Select scopes based on the access you need.
            </Text>
          </div>
        </div>
        <div className={styles.card_wrapper}>
          {scopes.map((item) => (
            <ApiTokenCard
              data-testid={`api-token-card-${item.name}`}
              key={item.name}
              name={item.name}
              label={item.label}
              description={item.description}
              onClick={() => {
                onCardClick(item.name);
              }}
              register={register}
            />
          ))}
        </div>
        <div className={styles.step_title}>
          <div className={`${styles.second_step} ${styles.step}`}>
            <Text as={'p'} type={'paragraph-1'} data-testid={'second-step-title'}>
              Name your token and click on Create to generate your token.
            </Text>
          </div>
        </div>
        <div className={styles.customTextInput}>
          <input type='text' name='name' {...register('name')} placeholder=' ' />
          <Button type='submit'>Create</Button>
          <label className={styles.tokenInputLabel}>
            Token name (you&apos;ve created <b>{tokens.length}</b> out of 30 tokens)
          </label>
        </div>
        <div className={styles.helperText}>
          <ul>
            <li>
              <span>Only alphanumeric characters with spaces and underscores are allowed.</span>
            </li>
            <li>
              <span>The name must be between 2 to 32 characters.</span>
            </li>
            <li>
              <span>Duplicate token names aren&apos;t allowed.</span>
            </li>
            <li>
              <span>
                The name cannot contain &ldquo;Binary&rdquo;, &ldquo;Deriv&rdquo;, or similar words.
              </span>
            </li>
            <li>
              <span>You can create up to 30 tokens for this account.</span>
            </li>
          </ul>
        </div>
        <div className={styles.step_title}>
          <div className={`${styles.third_step} ${styles.step}`}>
            <Text as={'p'} type={'paragraph-1'} data-testid={'third-step-title'}>
              Copy and paste the token into the app.
            </Text>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ApiTokenForm;
