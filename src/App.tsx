import './styles/main.scss';
import cl from './App.module.scss';
import React, {
   ChangeEvent,
   FC,
   ReactNode,
   useContext,
   useEffect,
   useId,
   useRef,
   useState,
} from 'react';
import { IoClose } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { IoIosSettings } from 'react-icons/io';
// models

interface IParam {
   id: number;
   name: string;
   type: 'string';
}

interface IParamValue {
   paramId: number;
   value: string;
}

interface IModel {
   name: string;
   paramValues: IParamValue[];
}

// UI Components

interface TextFieldProps {
   title: string;
   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
   placeholder?: string;
   value: string;
}
const TextField = React.forwardRef<HTMLInputElement | null, TextFieldProps>(
   ({ title, onChange, value, placeholder }, ref) => {
      const id = useId();
      return (
         <div className={cl.textField}>
            <label htmlFor={id} className={cl.textFieldLabel}>
               {title}
            </label>
            <input
               title={title}
               type="text"
               id={id}
               className={cl.textFieldInput}
               placeholder={placeholder ? placeholder : title}
               onChange={onChange}
               value={value}
               ref={ref}
            />
         </div>
      );
   },
);

interface ModalProps {
   children: ReactNode;
   isShow: boolean;
   title: string;
   setIsShow: (isShow: boolean) => void;
}

const Modal: FC<ModalProps> = ({ children, isShow, setIsShow, title }) => {
   return (
      <div
         className={[cl.modalContainer, isShow ? cl.active : ''].join(' ')}
         onClick={() => setIsShow(false)}
      >
         <div className={cl.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={cl.modalHeader}>
               <h4 className={cl.modalTitle}>{title}</h4>
               <Button title="Закрыть" onClick={() => setIsShow(false)}>
                  <IoClose />
               </Button>
            </div>
            <div className={cl.modalMain}>{children}</div>
         </div>
      </div>
   );
};

interface ButtonProps {
   children: ReactNode;
   onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
   title: string;
}

const Button: FC<ButtonProps> = ({ children, title, onClick }) => {
   return (
      <button className={cl.myButton} onClick={onClick} title={title}>
         {children}
      </button>
   );
};

// components

interface ModelItemProps {}

const ProductItem: FC<ModelItemProps> = () => {
   const { params, setParams } = useContext(ParamsContext);
   const { model, setModel } = useContext(ModelContext);

   const [isShowAddModal, setShowAddModal] = useState(false);

   // const getModel = (): IModel => {
   //    return modelData?.model ? model : ;
   // };

   return (
      <div className={cl.product}>
         <div className={cl.wrapper}>
            <div className={cl.productContent}>
               <div className={cl.productControl}>
                  <h3 className={cl.productTitle}>
                     {model.name}{' '}
                     <span>Количество параметров: {params.length}</span>
                  </h3>

                  <Button
                     onClick={() => setShowAddModal(true)}
                     title="Добавить параметр"
                  >
                     Добавить
                  </Button>
               </div>

               <div className={cl.params}>
                  <h5 className={cl.paramsTitle}>Параметры:</h5>
                  {params.map((param) => (
                     <ParamItem param={param} key={param.id} />
                  ))}
               </div>
            </div>
         </div>
         <ParamModal isShow={isShowAddModal} setIsShow={setShowAddModal} />
      </div>
   );
};

export const useDeleteParam = (
   params: IParam[],
   model: IModel,
   setParams: (newParams: IParam[]) => void,
   setModel: (model: IModel) => void,
) => {
   const handleDeleteParam = (id: number) => {
      const newParams = params.filter((p) => p.id !== id);
      const newParamValues = model.paramValues.filter(
         (pv) => pv.paramId !== id,
      );

      setParams(newParams);
      setModel({ name: model.name, paramValues: newParamValues });
   };

   return handleDeleteParam;
};

interface ParamItemProps {
   param: IParam;
}

const ParamItem: FC<ParamItemProps> = ({ param }) => {
   const { model, setModel } = useContext(ModelContext);
   const { params, setParams } = useContext(ParamsContext);
   const [isShowChangeModal, setShowChangeModal] = useState(false);

   const handleDeleteParam = useDeleteParam(params, model, setParams, setModel);

   return (
      <>
         <div className={cl.param}>
            <button
               onClick={() => handleDeleteParam(param.id)}
               title="Удалить параметр"
            >
               <MdDelete />
            </button>
            <button
               onClick={() => setShowChangeModal(true)}
               title="Изменить параметр"
            >
               <IoIosSettings />
            </button>
            <p className={cl.paramText}>
               {param.name}:
               <span>
                  {model.paramValues.find((p) => p.paramId === param.id)
                     ?.value || ''}
               </span>
            </p>
         </div>
         <ParamModal
            isShow={isShowChangeModal}
            setIsShow={setShowChangeModal}
            param={param}
         />
      </>
   );
};

export const useParamModal = (
   paramValues: IParamValue[],
   params: IParam[],
   model: IModel,
   setParams: (newParams: IParam[]) => void,
   setModel: (model: IModel) => void,
   isShow: boolean,
   setIsShow: (isShow: boolean) => void,
   param?: IParam,
) => {
   const [newParamName, setNewParamName] = useState(param?.name || '');
   const [newParamValue, setNewParamValue] = useState(
      paramValues.find((pv) => pv.paramId === param?.id)?.value || '',
   );

   useEffect(() => {
      if (!isShow && param) {
         setNewParamName(param.name);
      }
   }, [isShow]);

   const handleAddParam = (newParam: IParam) => {
      if (newParamName && newParamValue) {
         setParams([...params, newParam]);

         const newParamValues = [...model.paramValues];

         newParamValues.push({ paramId: newParam.id, value: newParamValue });

         setModel({ name: model.name, paramValues: newParamValues });

         setNewParamName('');
         setNewParamValue('');

         setIsShow(false);
      }
   };

   const handleChangeParam = (param: IParam) => {
      if (param.name) {
         const newParams = [...params];
         const changedParams = newParams.map(
            (p) => (p = p.id === param.id ? param : p),
         );
         setParams(changedParams);

         const changedParamValues = [...model.paramValues].map(
            (p) =>
               (p =
                  p.paramId === param.id
                     ? { paramId: p.paramId, value: newParamValue }
                     : p),
         );

         setModel({ name: model.name, paramValues: changedParamValues });

         setIsShow(false);
      }
   };

   return {
      handleAddParam,
      handleChangeParam,
      newParamName,
      setNewParamName,
      newParamValue,
      setNewParamValue,
   };
};

interface ParamModalProps {
   isShow: boolean;
   setIsShow: (isShow: boolean) => void;
   param?: IParam;
}

const ParamModal: FC<ParamModalProps> = ({ param, isShow, setIsShow }) => {
   const { model, setModel } = useContext(ModelContext);
   const { params, setParams } = useContext(ParamsContext);
   const inputRef = useRef<HTMLInputElement | null>(null);
   const [paramValues, setParamValues] = useState<IParamValue[]>(
      model.paramValues,
   );

   const {
      newParamName,
      setNewParamName,
      newParamValue,
      setNewParamValue,
      handleAddParam,
      handleChangeParam,
   } = useParamModal(
      paramValues,
      params,
      model,
      setParams,
      setModel,
      isShow,
      setIsShow,
      param,
   );

   useEffect(() => {
      if (isShow) {
         inputRef.current?.focus();
      }
   }, [isShow]);

   return (
      <Modal isShow={isShow} setIsShow={setIsShow} title="Добавление параметра">
         <div className={cl.paramModal}>
            <TextField
               title="Введите название параметра"
               onChange={(e) => setNewParamName(e.target.value)}
               value={newParamName}
               ref={inputRef}
            />
            <TextField
               title="Введите значение параметра"
               onChange={(e) => setNewParamValue(e.target.value)}
               value={newParamValue}
            />
            {param ? (
               <Button
                  onClick={() =>
                     handleChangeParam({
                        id: param.id,
                        name: newParamName,
                        type: param.type,
                     })
                  }
                  title="Применить изменения"
               >
                  Применить
               </Button>
            ) : (
               <Button
                  onClick={() =>
                     handleAddParam({
                        id: Date.now(),
                        name: newParamName,
                        type: 'string',
                     })
                  }
                  title="Добавить параметр"
               >
                  Добавить
               </Button>
            )}
         </div>
      </Modal>
   );
};

interface IModelState {
   model: IModel;
   setModel: (model: IModel) => void;
}
interface IParamsState {
   params: IParam[];
   setParams: (params: IParam[]) => void;
}

export const ModelContext = React.createContext<IModelState>({
   model: {
      name: '',
      paramValues: [],
   },
   setModel: () => {},
});
export const ParamsContext = React.createContext<IParamsState>({
   params: [],
   setParams: () => {},
});

const App = () => {
   const [params, setParams] = useState<IParam[]>([
      {
         id: 1,
         name: 'Цена',
         type: 'string',
      },
   ]);
   const [model, setModel] = useState<IModel>({
      name: 'Товар',
      paramValues: [
         {
            paramId: 1,
            value: '1000',
         },
      ],
   });

   return (
      <ModelContext.Provider
         value={{
            model,
            setModel,
         }}
      >
         <ParamsContext.Provider
            value={{
               params,
               setParams,
            }}
         >
            <ProductItem />
         </ParamsContext.Provider>
      </ModelContext.Provider>
   );
};

export default App;
